import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(MotionPathPlugin);
  gsap.to("#circle", {
    duration: 1,
    repeat: -1,
    repeatDelay: 0,
    yoyo: false,
    ease: "none",
    motionPath: {
      path: "#guide",
      align: "#guide",
      alignOrigin: [0.5, 0.5],
      autoRotate: true,
      start: 0,
      end: 1,
    },
  });
});

//   let rotation = 0;
//   let x = 0;
//   let y = 0;
//   const satellite = document.getElementById("satellite1");
//   setInterval(() => {
//     rotation += 1;
//     satellite.style.transform = `rotate(${rotation}deg)`;
//     console.log("circle position:", satellite);
//   }, 1000 / 60);

//   setInterval(() => {
//     x = Math.random() * 20 + x;
//     y = Math.random() * 20 + y;
//     satellite.style.transformOrigin = `${x}px ${y}px`;
//   }, 1000);
