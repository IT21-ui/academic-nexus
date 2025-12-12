import React from "react";

interface LoaderProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  fullScreen = true,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-2",
    lg: "h-16 w-16 border-[3px]",
  };

  const loader = (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} rounded-full border-t-primary border-r-primary/30 border-b-primary/30 border-l-primary/30 animate-spin`}
        aria-label="Loading..."
      />
      {size !== "sm" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${
              sizeClasses[size].split(" ")[0]
            } rounded-full bg-primary/10`}
          />
        </div>
      )}
    </div>
  );

  if (!fullScreen) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {loader}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        {loader}
        <p className="text-sm font-medium text-foreground/70">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
