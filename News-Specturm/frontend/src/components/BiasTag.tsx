interface BiasTag {
    bias: "left" | "center" | "right" | null;
};

const BIAS_COLORS = {
    left: {dot: "bg-blue-500", text: "text-blue-800", label: "Left"},
    center: {dot: "bg-gray-400", text: "text-gray-600", label: "Center"},
    right: {dot: "bg-red-500", text: "text-red-800", label: "Right"},

};

export default function BiasTag({ bias }: BiasTag) {
    if (!bias) return null;

    const {dot, text, label } = BIAS_COLORS[bias];
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${text}`}>
      <span className={`w-[7px] h-[7px] rounded-full ${dot}`} />
      {label}
    </span>
  );
}
    