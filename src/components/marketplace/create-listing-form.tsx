"use client";

import {
	AlertCircle,
	CheckCircle2,
	ImagePlus,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMAIL_PATTERN, formatPrice } from "@/lib/listing-utils";
import { createListing, uploadListingImage } from "@/lib/listings-mutations";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category } from "@/types/listing";

// The listings table stores a single image_url, so one photo per listing.
const MAX_PHOTOS = 1;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

interface Photo {
	id: string;
	url: string;
	name: string;
	file: File;
}
interface Values {
	title: string;
	description: string;
	price: string;
	category: Category | "";
	email: string;
}
type Errors = Partial<Record<keyof Values | "photos", string>>;

const EMPTY: Values = {
	title: "",
	description: "",
	price: "",
	category: "",
	email: "",
};

function validate(v: Values): Errors {
	const e: Errors = {};
	if (!v.title.trim()) e.title = "Enter a title for your listing.";
	if (!v.description.trim())
		e.description = "Add a description so buyers know what to expect.";
	if (v.price.trim() === "") e.price = "Enter a price.";
	else if (Number.isNaN(Number(v.price)) || Number(v.price) < 0)
		e.price = "Price can’t be negative.";
	if (!v.category) e.category = "Choose a category.";
	if (!v.email.trim()) e.email = "Enter your email address.";
	else if (!EMAIL_PATTERN.test(v.email.trim()))
		e.email = "Enter a valid email address, like name@example.com.";
	return e;
}

function Field({
	id,
	label,
	error,
	hint,
	children,
}: {
	id: string;
	label: string;
	error?: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="text-sm font-medium">
				{label}{" "}
				<span aria-hidden className="text-destructive">
					*
				</span>
				<span className="sr-only"> (required)</span>
			</label>
			{children}
			{hint && !error && (
				<p className="text-xs text-muted-foreground">{hint}</p>
			)}
			{error && (
				<p id={`${id}-error`} className="text-sm text-destructive">
					{error}
				</p>
			)}
		</div>
	);
}

export function CreateListingForm() {
	const [values, setValues] = useState<Values>(EMPTY);
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [errors, setErrors] = useState<Errors>({});
	const [submitted, setSubmitted] = useState(false);
	const [status, setStatus] = useState<"idle" | "submitting" | "success">(
		"idle",
	);
	const [dragging, setDragging] = useState(false);
	const [published, setPublished] = useState<{
		id: string;
		title: string;
		price: number;
	} | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const urls = useRef<string[]>([]);

	useEffect(() => {
		const tracked = urls.current;
		return () => tracked.forEach((u) => URL.revokeObjectURL(u));
	}, []);

	function update<K extends keyof Values>(key: K, value: Values[K]) {
		const next = { ...values, [key]: value };
		setValues(next);
		if (submitted)
			setErrors((prev) => ({ ...validate(next), photos: prev.photos }));
	}

	function addFiles(files: FileList | File[]) {
		const incoming = Array.from(files);
		let photoError: string | undefined;
		const next: Photo[] = [];
		for (const file of incoming) {
			if (!ACCEPTED.includes(file.type)) {
				photoError = `“${file.name}” isn’t supported. Use JPG, PNG or WebP.`;
				continue;
			}
			if (file.size > MAX_BYTES) {
				photoError = `“${file.name}” is larger than 5 MB.`;
				continue;
			}
			if (photos.length + next.length >= MAX_PHOTOS) {
				photoError = `You can add up to ${MAX_PHOTOS} photos.`;
				break;
			}
			const url = URL.createObjectURL(file);
			urls.current.push(url);
			next.push({
				id: `${file.name}-${file.lastModified}-${url.slice(-8)}`,
				url,
				name: file.name,
				file,
			});
		}
		if (next.length) setPhotos((p) => [...p, ...next]);
		setErrors((prev) => ({ ...prev, photos: photoError }));
	}

	function removePhoto(id: string) {
		const photo = photos.find((p) => p.id === id);
		if (photo) {
			URL.revokeObjectURL(photo.url);
			urls.current = urls.current.filter((u) => u !== photo.url);
		}
		setPhotos((p) => p.filter((x) => x.id !== id));
		setErrors((prev) => ({ ...prev, photos: undefined }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitted(true);
		setSubmitError(null);
		const found = validate(values);
		setErrors((prev) => ({ ...found, photos: prev.photos }));
		if (Object.keys(found).length > 0) return;

		setStatus("submitting");
		try {
			const file = photos[0]?.file;
			const image_url = file ? await uploadListingImage(file) : null;
			const price = Number(values.price);
			const title = values.title.trim();
			const id = await createListing({
				title,
				description: values.description.trim(),
				price,
				category: values.category as Category,
				seller_email: values.email.trim(),
				image_url,
			});
			router.refresh(); // make sure the marketplace lists the new item
			setPublished({ id, title, price });
			setStatus("success");
		} catch (err) {
			setSubmitError(
				err instanceof Error ? err.message : "Something went wrong.",
			);
			setStatus("idle");
		}
	}

	function reset() {
		photos.forEach((p) => URL.revokeObjectURL(p.url));
		urls.current = [];
		setPhotos([]);
		setValues(EMPTY);
		setErrors({});
		setSubmitted(false);
		setPublished(null);
		setSubmitError(null);
		setStatus("idle");
	}

	if (status === "success" && published) {
		return (
			<div
				role="status"
				className="flex flex-col items-center rounded-xl border bg-card px-6 py-14 text-center"
			>
				<div className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
					<CheckCircle2 className="size-7" aria-hidden />
				</div>
				<h2 className="mt-4 text-xl font-semibold">
					Your listing is live
				</h2>
				<p className="mt-1 max-w-md text-sm text-muted-foreground">
					“{published.title}” for {formatPrice(published.price)} has
					been published to Marketplace.
				</p>
				<div className="mt-6 flex flex-wrap justify-center gap-2">
					<Link
						href={`/item/${published.id}`}
						className={cn(buttonVariants(), "h-10 px-4")}
					>
						View your listing
					</Link>
					<Link
						href="/"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"h-10 px-4",
						)}
					>
						Back to Marketplace
					</Link>
					<Button
						variant="outline"
						className="h-10 px-4"
						onClick={reset}
					>
						Create another listing
					</Button>
				</div>
			</div>
		);
	}

	const submitting = status === "submitting";
	const errorCount = Object.values(errors).filter(Boolean).length;

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			className="space-y-6 rounded-xl border bg-card p-5 sm:p-6"
		>
			{submitError && (
				<div
					role="alert"
					className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
				>
					<AlertCircle
						className="mt-0.5 size-4 shrink-0"
						aria-hidden
					/>
					<span>We couldn’t publish your listing. {submitError}</span>
				</div>
			)}

			{submitted && errorCount > 0 && (
				<div
					role="alert"
					className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
				>
					<AlertCircle className="size-4 shrink-0" aria-hidden />
					Please fix the highlighted fields before publishing.
				</div>
			)}

			<div className="space-y-2">
				<p className="text-sm font-medium" id="photos-label">
					Photos
				</p>
				<input
					ref={inputRef}
					id="photos"
					type="file"
					accept={ACCEPTED.join(",")}
					className="sr-only"
					aria-labelledby="photos-label"
					onChange={(e) => {
						if (e.target.files) addFiles(e.target.files);
						e.target.value = "";
					}}
				/>
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					onDragOver={(e) => {
						e.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={(e) => {
						e.preventDefault();
						setDragging(false);
						addFiles(e.dataTransfer.files);
					}}
					className={cn(
						"flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
						dragging
							? "border-primary bg-primary/5"
							: "bg-muted/40 hover:bg-muted",
					)}
				>
					<span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
						<Upload className="size-5" aria-hidden />
					</span>
					<span className="font-medium">Add photos of your item</span>
					<span className="text-xs text-muted-foreground">
						Click to browse or drag and drop. JPG, PNG or WebP, up
						to 5 MB. One photo per listing.
					</span>
				</button>
				{errors.photos && (
					<p role="alert" className="text-sm text-destructive">
						{errors.photos}
					</p>
				)}

				{photos.length > 0 && (
					<ul className="grid grid-cols-3 gap-3 pt-1 sm:grid-cols-5">
						{photos.map((photo, i) => (
							<li
								key={photo.id}
								className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={photo.url}
									alt={`Preview of ${photo.name}`}
									className="size-full object-cover"
								/>
								{i === 0 && (
									<span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
										Cover
									</span>
								)}
								<button
									type="button"
									onClick={() => removePhoto(photo.id)}
									aria-label={`Remove ${photo.name}`}
									className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-black focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
								>
									<X className="size-4" />
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			<Field id="title" label="Title" error={errors.title}>
				<Input
					id="title"
					value={values.title}
					placeholder="What are you selling?"
					maxLength={100}
					aria-required
					aria-invalid={!!errors.title}
					aria-describedby={errors.title ? "title-error" : undefined}
					onChange={(e) => update("title", e.target.value)}
					className="h-10 text-base md:text-sm"
				/>
			</Field>

			<Field
				id="description"
				label="Description"
				error={errors.description}
			>
				<Textarea
					id="description"
					rows={5}
					value={values.description}
					placeholder="Describe your item, condition, and other important details."
					aria-required
					aria-invalid={!!errors.description}
					aria-describedby={
						errors.description ? "description-error" : undefined
					}
					onChange={(e) => update("description", e.target.value)}
					className="text-base md:text-sm"
				/>
			</Field>

			<div className="grid gap-6 sm:grid-cols-2">
				<Field id="price" label="Price" error={errors.price}>
					<div className="relative">
						<span
							aria-hidden
							className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground"
						>
							USD $
						</span>
						<Input
							id="price"
							type="number"
							inputMode="decimal"
							min={0}
							step="0.01"
							placeholder="0.00"
							value={values.price}
							aria-required
							aria-invalid={!!errors.price}
							aria-describedby={
								errors.price ? "price-error" : undefined
							}
							onKeyDown={(e) => {
								if (
									e.key === "-" ||
									e.key === "e" ||
									e.key === "E"
								)
									e.preventDefault();
							}}
							onChange={(e) => update("price", e.target.value)}
							className="h-10 pl-16 text-base md:text-sm"
						/>
					</div>
				</Field>

				<Field id="category" label="Category" error={errors.category}>
					<Select
						value={values.category || null}
						onValueChange={(v) =>
							update("category", (v ?? "") as Category | "")
						}
					>
						<SelectTrigger
							id="category"
							className="h-10 w-full text-base md:text-sm"
							aria-required
							aria-invalid={!!errors.category}
							aria-describedby={
								errors.category ? "category-error" : undefined
							}
						>
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map((c) => (
								<SelectItem key={c} value={c}>
									{c}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
			</div>

			<Field
				id="email"
				label="Seller email"
				error={errors.email}
				hint="Buyers will use this address to contact you."
			>
				<Input
					id="email"
					type="email"
					autoComplete="email"
					placeholder="you@example.com"
					value={values.email}
					aria-required
					aria-invalid={!!errors.email}
					aria-describedby={errors.email ? "email-error" : undefined}
					onChange={(e) => update("email", e.target.value)}
					className="h-10 text-base md:text-sm"
				/>
			</Field>

			<div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
				<Link
					href="/"
					className={cn(
						buttonVariants({ variant: "outline" }),
						"h-10 px-4",
						submitting && "pointer-events-none opacity-50",
					)}
				>
					Cancel
				</Link>
				<Button
					type="submit"
					disabled={submitting}
					className="h-10 px-5"
				>
					{submitting ? (
						<Loader2 className="animate-spin" aria-hidden />
					) : (
						<ImagePlus aria-hidden />
					)}
					{submitting ? "Publishing…" : "Publish Listing"}
				</Button>
			</div>
		</form>
	);
}
