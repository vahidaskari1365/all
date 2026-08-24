import { Reveal, Underline } from "@/components/motion";

export function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  align?: "center" | "start";
}) {
  const center = align === "center";
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <span className="inline-block rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-bold text-primary-700 ring-1 ring-inset ring-primary-200">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink sm:text-3xl md:text-[2.1rem]">
        {title}
      </h2>
      <Underline className={center ? "mx-auto mt-4" : "mt-4"} />
      {desc && (
        <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
          {desc}
        </p>
      )}
    </Reveal>
  );
}
