"use client";

type DeleteButtonProps = {
  messageId: string;
  className?: string;
};

export default function DeleteButton({ messageId, className = "" }: DeleteButtonProps) {
  const handleDelete = async () => {
    const res = await fetch(`/api/messages/${messageId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      // optional: refresh UI or redirect
      console.log("Message deleted");
      location.reload();
    } else {
      const data = await res.json();
      console.error("Delete failed:", data.error);
      alert("Failed to delete message");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className={`flex items-center justify-center p-2 bg-transparent text-white rounded-md cursor-pointer hover:bg-red-500 hover:scale-105 transition-all duration-200 ease-in-out ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18"></path>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
      </svg>
    </button>
  );
}