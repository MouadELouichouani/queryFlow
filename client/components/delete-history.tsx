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
import { Trash2 } from "lucide-react";
import { deleteHistory } from "@/services/history";
import { toast } from "sonner";

export function DeleteHistory({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (text.trim().toLowerCase() !== "delete") return;

    setLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await deleteHistory(id, token!);

      if (res.status === 200) {
        toast.success(res.data.message);
        onDeleted(id);
      }
    } catch {
      toast.error("An error occured. Try again");
    } finally {
      setLoading(false);
      setText("");

      const closeBtn = document.querySelector(
        "[data-delete-dialog-close]",
      ) as HTMLButtonElement | null;
      closeBtn?.click();
    }
  };

  const valid = text.toLowerCase() === "delete";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center gap-2 cursor-pointer items-center">
          <Trash2 className="text-red-500" />
          <span className="text-red-500">Delete</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete history</DialogTitle>
          <DialogDescription>
            Type{" "}
            <strong className="dark:text-white/70 text-black/70">delete</strong>{" "}
            to confirm deletion.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="delete"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="secondary" data-delete-dialog-close>
              Close
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            disabled={!valid || loading}
            onClick={handleDelete}
            className="cursor-pointer hover:bg-red-900 duration-150"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
