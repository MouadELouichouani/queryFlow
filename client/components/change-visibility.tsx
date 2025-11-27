"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share } from "lucide-react";
import { toast } from "sonner";
import { updateVisibility } from "@/services/history";

export function ChangeVisibility({
  id,
  hisVisibility,
  setToPublic,
  setUrl,
  onChangeVis,
}: {
  id: string;
  setUrl: (url: string) => void;
  hisVisibility: "public" | "private";
  setToPublic: (toPublic: boolean) => void;
  onChangeVis: (newVisibility: "public" | "private") => void;
}) {
  const [loading, setLoading] = useState(false);
  const visibility = hisVisibility === "private" ? "public" : "private";
  const handleEdit = async () => {
    setLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await updateVisibility(id, token!, visibility);

      if (res.status === 200) {
        toast.success(res.data.message);
        onChangeVis(res.data.visibility);
        if (res.data.visibility === "public") {
          setToPublic(true);
          setUrl(res.data.url);
        }
      }
    } catch {
      toast.error("An error occured. Try again");
    } finally {
      setLoading(false);

      const closeBtn = document.querySelector(
        "[data-delete-dialog-close]",
      ) as HTMLButtonElement | null;
      closeBtn?.click();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center gap-2 cursor-pointer">
          <Share className="text-muted-foreground" />
          <span>Share</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Visibility</DialogTitle>
          <DialogDescription>
            Are you sure you want to make this chat {visibility}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="secondary" data-delete-dialog-close>
              Close
            </Button>
          </DialogClose>

          <Button
            disabled={loading}
            onClick={handleEdit}
            className="cursor-pointer"
          >
            {loading ? "Editing..." : `Change to ${visibility}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
