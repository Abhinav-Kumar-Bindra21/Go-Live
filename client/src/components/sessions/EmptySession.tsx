import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";

const EmptySession = () => {
  return (
    <div className="w-full bg-white/50 backdrop-blur rounded-3xl p-12 xl:py-24 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4">
      <h3 className="text-xl lg:text-2xl font-medium text-slate-700">No Meeting History Yet</h3>
      <p>Once you create a join meeting calls, your meeting sessions, participants, and chat logs will appear here.</p>

      <Link
        to="/dashboard"
        className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-full text-sm transition-all inline-flex items-center gap-2 mt-2"
      >
        Start a Meeting
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
};

export default EmptySession;
