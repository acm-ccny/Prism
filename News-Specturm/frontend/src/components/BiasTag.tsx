interface BiasTagProps {
    bias: "left" | "center" | "right" | null;
}

const BIAS_CONFIG = {
    left:    { dot: "bg-blue-500",  text: "text-blue-800",  label: "Left" },
    center:  { dot: "bg-gray-400",  text: "text-gray-600",  label: "Center" },
    right:   { dot: "bg-red-500",   text: "text-red-800",   label: "Right" },
    unknown: { dot: "bg-gray-300",  text: "text-gray-400",  label: "Unknown" },
};

export default function BiasTag({ bias }: BiasTagProps) {
    const { dot, text, label } = BIAS_CONFIG[bias ?? "unknown"];
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${text}`}>
            <span className={`w-[7px] h-[7px] rounded-full ${dot}`} />
            {label}
        </span>
    );
}
    