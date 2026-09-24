import { VideoIcon } from "lucide-react";

const Loader = ({ text = "Loading" }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-900 z-50">
      <div className="relative flex items-center justify-center">
        <div className="size-16 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
        <VideoIcon className="size-6 text-primary absolute" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600 animate-ping">{text}</p>
    </div>
  );
};

export default Loader;
