export default function AvatarStack({
  users,
  max = 3,
  size = "sm",
  borderColor = "border-surface-700",
}) {
  const sizes = { xs: "w-4 h-4", sm: "w-5 h-5", md: "w-6 h-6", lg: "w-7 h-7" };
  const spacing = { xs: "-space-x-1", sm: "-space-x-1.5", md: "-space-x-2", lg: "-space-x-2" };
  const borders = { xs: "border", sm: "border-[1.5px]", md: "border-2", lg: "border-2" };

  const overflow = users.length > max ? users.length - max : 0;

  return (
    <div className={`flex items-center ${spacing[size]}`}>
      {users.slice(0, max).map((user) => (
        <img
          key={user.id}
          src={user.avatar}
          alt={user.name || ""}
          title={user.name || ""}
          className={`${sizes[size]} rounded-full ${borders[size]} ${borderColor} object-cover`}
        />
      ))}
      {overflow > 0 && (
        <div
          className={`${sizes[size]} rounded-full ${borders[size]} ${borderColor} bg-surface-600 flex items-center justify-center`}
        >
          <span className="text-[7px] font-bold text-white/50">+{overflow}</span>
        </div>
      )}
    </div>
  );
}
