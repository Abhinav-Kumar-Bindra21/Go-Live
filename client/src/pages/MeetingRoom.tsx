import { useNavigate, useParams } from "react-router";
import { dummyUser, dummyMeetingDetails } from "../assets/asset";
import { useCallback, useState } from "react";
import VideoGrid from "../components/Meeting/VideoGrid";
import useWebRTC from "../hooks/useWebRTC";
import ChatPanel from "../components/Meeting/ChatPanel";
import { useChat } from "../hooks/useChat";
import ParticipantList from "../components/Meeting/ParticipantList";

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const userData = dummyUser;

  const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);

  const handleMeetingEnded = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  // Initialize webRTC

  const { localStream, remoteUsers, audioEnabled, videoEnabled, toggleAudio, toggleVideo, endMeeting } = useWebRTC(
    meetingId,
    userData,
    handleMeetingEnded,
  );

  // initialize chat

  const { message, sendMessage, unreadCount, isChatOpen, toggleChat } = useChat(meetingId, userData);

  const isHost = true;

  const handleLeave = () => {};

  const handleEndMeeting = () => {};

  return (
    <div className="h-screen w-screen bh-slate-100 text-slate-900 flex flex-col overflow-hidden relative font-sans">
      {/* Top Bar */}

      <header className="w-full bg-white/90 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {dummyMeetingDetails.title}({meetingId || dummyMeetingDetails.meetingId})
          </h2>
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* Main Content area (video Grid + Side Panels) */}

      <div className="flex-1 flex overflow-hidden relative">
        {/* video grid center */}

        <VideoGrid
          localStream={localStream}
          localUser={userData}
          remoteUsers={remoteUsers}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
        />

        {/* In Meeting chat Drawer */}

        <ChatPanel
          isOpen={isChatOpen}
          onClose={toggleChat}
          message={message}
          onSendMessage={sendMessage}
          currentUser={userData}
        />

        {/* Participants Drawer */}

        <ParticipantList
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          localUser={userData}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          remoteUsers={remoteUsers}
          meetingHostId={dummyUser.id}
        />

        {/* Bottom Floating Control BAr */}
      </div>
    </div>
  );
};

export default MeetingRoom;
