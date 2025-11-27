"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CopyCheck } from "lucide-react";
import { useState } from "react";

export function ChatLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + "/chat/" + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view chat.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              value={window.location.origin + "/chat/" + url}
              readOnly
              className="pr-10"
            />

            {copied ? (
              <CopyCheck
                className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600"
                size={15}
              />
            ) : (
              <Copy
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer duration-200 text-black/60 hover:text-black/70 dark:text-white/60 dark:hover:text-white/70"
                size={15}
                onClick={handleCopy}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
