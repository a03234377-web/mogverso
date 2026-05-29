export function BackgroundEffects() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-[100px] -left-[100px] h-[600px] w-[600px] animate-orb-float-1 rounded-full bg-[rgba(232,184,75,0.05)] blur-[80px] max-md:-top-[60px] max-md:-left-[60px] max-md:h-[320px] max-md:w-[320px] max-md:blur-[60px]" />
        <div className="absolute top-[40%] right-[-100px] h-[500px] w-[500px] animate-orb-float-2 rounded-full bg-[rgba(168,85,247,0.04)] blur-[80px] max-md:right-[-60px] max-md:h-[280px] max-md:w-[280px] max-md:blur-[60px]" />
        <div className="absolute bottom-[-50px] left-[30%] h-[450px] w-[450px] animate-orb-float-3 rounded-full bg-[rgba(59,130,246,0.04)] blur-[80px] max-md:bottom-[-30px] max-md:h-[260px] max-md:w-[260px] max-md:blur-[60px]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]"
        aria-hidden
      />
    </>
  );
}
