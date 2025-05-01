
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {}

export const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn("relative ml-3 space-y-2", className)}
        {...props}
      />
    );
  }
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("relative pb-2 pl-6", className)}
        {...props}
      />
    );
  }
);
TimelineItem.displayName = "TimelineItem";

export interface TimelineIconProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-0 top-0 flex h-5 w-5 items-center justify-center rounded-full border bg-background",
          className
        )}
        {...props}
      />
    );
  }
);
TimelineIcon.displayName = "TimelineIcon";

export interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-2.5 top-5 -ml-px h-full w-[1px] -translate-x-1/2 bg-muted-foreground/20",
          className
        )}
        {...props}
      />
    );
  }
);
TimelineConnector.displayName = "TimelineConnector";

export interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      />
    );
  }
);
TimelineHeader.displayName = "TimelineHeader";

export interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const TimelineTitle = React.forwardRef<HTMLHeadingElement, TimelineTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("font-medium leading-none", className)}
        {...props}
      />
    );
  }
);
TimelineTitle.displayName = "TimelineTitle";

export interface TimelineDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const TimelineDescription = React.forwardRef<HTMLParagraphElement, TimelineDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);
TimelineDescription.displayName = "TimelineDescription";
