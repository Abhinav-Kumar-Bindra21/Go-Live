import { useNavigate, useParams } from "react-router";
import { dummyUser, dummyMeetingDetails } from "../assets/asset";
import { useCallback, useEffect, useMemo, useState } from "react";
import VideoGrid from "../components/Meeting/VideoGrid";
import { useWebRTC } from "../hooks/useWebRTC";
import ChatPanel from "../components/Meeting/ChatPanel";
import { useChat } from "../hooks/useChat";
import ParticipantList from "../components/Meeting/ParticipantList";
import ControlBar from "../components/Meeting/ControlBar";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/react";
import api from "../config/api";
import Loader from "../components/Loader";

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const { user } = useUser();
  const { getToken } = useAuth();

  const userData = useMemo(() => {
    if (!user) return null;

    return {
      id: user.id,
      name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "User",
      email: user.primaryEmailAddress?.emailAddress || "",
      image: user.imageUrl || "",
    };
  }, [user?.id, user?.fullName, user?.firstName, user?.primaryEmailAddress?.emailAddress, user?.imageUrl]);

  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  //  Fetch meeting details to verify validity BEFORE enabling WebRTC camera access
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = await getToken();
        const res = await api.get(`/api/meetings/${meetingId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.meeting.status === "ended") {
          toast.error("This meeting has ended");
          navigate("/dashboard");
          return;
        }

        setMeeting(res.data.meeting);
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || "Meeting not found or has ended";
        toast.error(errorMsg);
        navigate("/dashboard");
      } finally {
        setLoadingMeeting(false);
      }
    };

    fetchMeeting();
  }, [meetingId, navigate]);

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

  const hostId = meeting?.host?.id || meeting?.host;
  const isHost = Boolean(hostId && userData?.id && hostId.toString() === userData.id.toString());

  const handleLeave = () => {
    toast("You left the meeting");
    navigate("/dashboard");
  };

  const handleEndMeeting = () => {
    endMeeting();
    toast("Meeting ended for all participants");
    navigate("/dashboard");
  };

  if (loadingMeeting) {
    return <Loader text="Joining meeting room..." />;
  }

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
      </div>

      {/* Bottom Floating Control Bar */}

      <ControlBar
        roomId={meetingId || dummyMeetingDetails.meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={() => setIsParticipantsOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadCount}
        participantCount={1 + remoteUsers.length}
        isHost={isHost}
        onLeave={handleLeave}
        onEndMeeting={handleEndMeeting}
      />
    </div>
  );
};

export default MeetingRoom;
