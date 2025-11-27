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
import { Input } from "@/components/ui/input";
import { FolderPen } from "lucide-react";
import { updateTitle } from "@/services/history";
import { toast } from "sonner";

export function RenameHistory({
  id,
  title,
  onRename,
}: {
  id: string;
  onRename: (id: string, newTitle: string) => void;
  title: string;
}) {
  const [titleInput, setTitleInput] = useState(title || "");
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    if (titleInput.trim().toLowerCase() === "") return;

    setLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await updateTitle(id, titleInput, token!);

      if (res.status === 200) {
        toast.success(res.data.message);
        onRename(id, res.data.title);
      }
    } catch {
      toast.error("An error occured. Try again");
    } finally {
      setLoading(false);
      setTitleInput("");

      const closeBtn = document.querySelector(
        "[data-delete-dialog-close]",
      ) as HTMLButtonElement | null;
      closeBtn?.click();
    }
  };

  const valid = titleInput.trim().length > 0;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center gap-2 cursor-pointer">
          <FolderPen className="text-muted-foreground" />
          <span>Rename</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit title</DialogTitle>
          <DialogDescription>
            Type your new title and press edit.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Your title"
          onKeyDown={(e) => e.stopPropagation()}
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
        />

        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="secondary" data-delete-dialog-close>
              Close
            </Button>
          </DialogClose>

          <Button
            disabled={!valid || loading}
            onClick={handleEdit}
            className="cursor-pointer"
          >
            {loading ? "Editing..." : "Edit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
