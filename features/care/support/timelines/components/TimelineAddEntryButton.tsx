type Props = {
  show: boolean;
  onClick: () => void;
};

export default function TimelineAddEntryButton({ show, onClick }: Props) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-teal-400 text-3xl font-bold text-white shadow-2xl md:bottom-6"
    >
      +
    </button>
  );
}