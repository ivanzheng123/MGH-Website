import { FC, useEffect, useRef } from "react";

export const ParticleBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d"); //2d drawing context

    let animationId: number;
    const particles: {
      x: number;
      y: number;
      dx: number;
      dy: number;
      radius: number;
      color: string;
    }[] = [];

    if (!canvas || !ctx) return; //saftey check

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight / 2; //top half of screen (doesnt exactly match our screen but you can barely notice)
    };

    resizeCanvas(); //set the resized canvas

    // Color palette
    const colors = [
      "rgba(0, 119, 182, 0.6)", // Blue
      "rgba(3, 4, 94, 0.5)", // Dark blue
      "rgba(202, 240, 248, 0.5)", // Light blue
      "rgba(72, 202, 228, 0.5)", // Cyan
    ];

    const numParticles = 80;

    //Initalize partiles with random positions, speed, size and color
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 0.8,
        dy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 3 + 1, //between 1 and 4
        color: colors[Math.floor(Math.random() * colors.length)], //random color
      });
    }

    //draw loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Draw glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d\.]+\)$/, "0.2)"); //lower opactity allows glow
        ctx.fill();

        // Draw main particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Update position
        p.x += p.dx;
        p.y += p.dy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
        if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;
      }

      //Requesting the next animation frame
      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);

    //Cleanup function when the compomenet unmounts
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-1/2 pointer-events-none z-0" />;
};
