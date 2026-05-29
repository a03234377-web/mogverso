export function BackgroundEffects() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[100px] -top-[100px] h-[600px] w-[600px] rounded-full bg-[rgba(232,184,75,0.05)] blur-[80px] animate-orb-float-1" />
        <div className="absolute right-[-100px] top-[40%] h-[500px] w-[500px] rounded-full bg-[rgba(168,85,247,0.04)] blur-[80px] animate-orb-float-2" />
        <div className="absolute bottom-[-50px] left-[30%] h-[450px] w-[450px] rounded-full bg-[rgba(59,130,246,0.04)] blur-[80px] animate-orb-float-3" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]"
        aria-hidden
      />
    </>
  );
}
