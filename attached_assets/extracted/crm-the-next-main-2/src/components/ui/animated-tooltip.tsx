//@ts-nocheck
import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
const CircleAvatar = ({ name, size = 10 }) => {
  // Adjusted size to Tailwind's scale
  // Function to extract initials from the name
  const getInitials = (name) => {
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase();
  };

  // Dynamic style for font size based on avatar size. Tailwind's scale is used for general sizing.
  const style = {
    fontSize: `${size * 1.25}px`, // Dynamic font size, adjust multiplier as needed for design
  };

  return (
    <div
      className={`rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white transition duration-500 hover:scale-105 hover:z-30 relative w-${size} h-${size}`}
      style={style}
      onMouseMove={(e) => e.stopPropagation()} // Prevents parent hover effects if needed
    >
      {getInitials(name)}
    </div>
  );
};
export const AnimatedTooltip = ({ items }: { items: {}[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); // set the x value, which is then used in transform and rotate
  };

  return (
    <>
      {items.map((item, idx) => (
        <div
          className="-mr-4  relative group"
          key={item.user.name}
          onMouseEnter={() => setHoveredIndex(item.user.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {hoveredIndex === item.user.id && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 10,
                },
              }}
              exit={{ opacity: 0, y: 20, scale: 0.6 }}
              style={{
                translateX: translateX,
                rotate: rotate,
                whiteSpace: "nowrap",
              }}
              className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs  flex-col items-center justify-center rounded-md bg-black z-50 shadow-xl px-4 py-2"
            >
              <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px " />
              <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px " />
              <div className="font-bold text-white relative z-30 text-base">
                {item.user.name}
              </div>
              <div className="text-white text-xs">{item.user.role.name}</div>
            </motion.div>
          )}
          <CircleAvatar name={item.user.name} size={14} />
        </div>
      ))}
    </>
  );
};
