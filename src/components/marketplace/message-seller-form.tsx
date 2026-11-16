"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMAIL_PATTERN } from "@/lib/listing-utils";
import { sendMessage } from "@/lib/listings-mutations";

type Status = "idle" | "sending" | "success";
type Errors = { email?: string; message?: string };

export function MessageSellerForm({
	listingId,
	title,
	sellerEmail,
}: {
	listingId: string;
	title: string;
	sellerEmail: string;
}) {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState(
		`Hi, is “${title}” still available?`,
	);
	const [errors, setErrors] = useState<Errors>({});
	const [status, setStatus] = useState<Status>("idle");
	const [submitted, setSubmitted] = useState(false);
	const [sendError, setSendError] = useState<string | null>(null);

	function validate(values = { email, message }): Errors {
		const next: Errors = {};
		if (!values.email.trim()) next.email = "Enter your email address.";
		else if (!EMAIL_PATTERN.test(values.email.trim()))
			next.email = "Enter a valid email address, like name@example.com.";
		if (!values.message.trim())
			next.message = "Write a message for the seller.";
		return next;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitted(true);
		setSendError(null);
		const found = validate();
		setErrors(found);
		if (Object.keys(found).length > 0) return;

		setStatus("sending");
		try {
			await sendMessage({
				listing_id: listingId,
				buyer_email: email.trim(),
				seller_email: sellerEmail,
				message: message.trim(),
			});
			setStatus("success");
		} catch (err) {
			setSendError(
				err instanceof Error ? err.message : "Something went wrong.",
			);
			setStatus("idle");
		}
	}

	if (status === "success") {
		return (
			<section
				aria-labelledby="message-heading"
				className="rounded-xl border bg-card p-5"
			>
				<h2 id="message-heading" className="text-lg font-semibold">
					Message Seller
				</h2>
				<div
					role="status"
					className="mt-3 flex gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-900"
				>
					<CheckCircle2
						className="mt-0.5 size-5 shrink-0"
						aria-hidden
					/>
					<div className="text-sm">
						<p className="font-medium">Message sent</p>
						<p className="mt-0.5">
							Your message to {sellerEmail} was saved. They’ll be
							able to reply to {email.trim()}.
						</p>
						<Button
							variant="outline"
							className="mt-3 h-9 bg-white px-3"
							onClick={() => {
								setStatus("idle");
								setSubmitted(false);
								setEmail("");
							}}
						>
							Send another message
						</Button>
					</div>
				</div>
			</section>
		);
	}

	const hasErrors = submitted && Object.keys(errors).length > 0;

	return (
		<section
			aria-labelledby="message-heading"
			className="rounded-xl border bg-card p-5"
		>
			<h2 id="message-heading" className="text-lg font-semibold">
				Message Seller
			</h2>
			<form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
				{sendError && (
					<div
						role="alert"
						className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
					>
						<AlertCircle
							className="mt-0.5 size-4 shrink-0"
							aria-hidden
						/>
						<span>Your message wasn’t sent. {sendError}</span>
					</div>
				)}
				{hasErrors && (
					<div
						role="alert"
						className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
					>
						<AlertCircle className="size-4 shrink-0" aria-hidden />
						Your message wasn’t sent. Please fix the highlighted
						fields.
					</div>
				)}

				<div className="space-y-1.5">
					<label
						htmlFor="buyer-email"
						className="text-sm font-medium"
					>
						Your email{" "}
						<span aria-hidden className="text-destructive">
							*
						</span>
					</label>
					<Input
						id="buyer-email"
						type="email"
						autoComplete="email"
						placeholder="you@example.com"
						value={email}
						aria-required
						aria-invalid={!!errors.email}
						aria-describedby={
							errors.email ? "buyer-email-error" : undefined
						}
						onChange={(e) => {
							setEmail(e.target.value);
							if (submitted)
								setErrors(
									validate({
										email: e.target.value,
										message,
									}),
								);
						}}
						className="h-10 text-base md:text-sm"
					/>
					{errors.email && (
						<p
							id="buyer-email-error"
							className="text-sm text-destructive"
						>
							{errors.email}
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="buyer-message"
						className="text-sm font-medium"
					>
						Message{" "}
						<span aria-hidden className="text-destructive">
							*
						</span>
					</label>
					<Textarea
						id="buyer-message"
						rows={4}
						value={message}
						aria-required
						aria-invalid={!!errors.message}
						aria-describedby={
							errors.message ? "buyer-message-error" : undefined
						}
						onChange={(e) => {
							setMessage(e.target.value);
							if (submitted)
								setErrors(
									validate({
										email,
										message: e.target.value,
									}),
								);
						}}
						className="text-base md:text-sm"
					/>
					{errors.message && (
						<p
							id="buyer-message-error"
							className="text-sm text-destructive"
						>
							{errors.message}
						</p>
					)}
				</div>

				<Button
					type="submit"
					disabled={status === "sending"}
					className="h-10 w-full px-4 sm:w-auto"
				>
					{status === "sending" ? (
						<Loader2 className="animate-spin" aria-hidden />
					) : (
						<Send aria-hidden />
					)}
					{status === "sending" ? "Sending…" : "Send Message"}
				</Button>
			</form>
		</section>
	);
}
