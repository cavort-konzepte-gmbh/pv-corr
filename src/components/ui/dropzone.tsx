import * as React from "react";
import { cn } from "@/lib/utils";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { UploadCloud } from "lucide-react";

const variants = {
  base: "relative rounded-md flex justify-center items-center flex-col cursor-pointer border border-dashed border-muted-foreground/25 transition-colors duration-200 ease-in-out",
  active: "border-primary/50 bg-primary/5",
  disabled: "bg-muted/50 cursor-default pointer-events-none",
  accept: "border-primary/50 bg-primary/5",
  reject: "border-destructive/50 bg-destructive/5",
};

type InputProps = {
  width?: string | number;
  height?: string | number;
  className?: string;
  value?: File[];
  onChange?: (files: File[]) => void | Promise<void>;
  onFilesAdded?: (files: File[]) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, "disabled">;
};

const Dropzone = React.forwardRef<HTMLDivElement, InputProps>(
  (
    {
      width,
      height,
      className,
      value,
      onChange,
      onFilesAdded,
      disabled = false,
      dropzoneOptions,
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<File[]>(value || []);

    React.useEffect(() => {
      if (value) {
        setFiles(value);
      }
    }, [value]);

    const onDrop = React.useCallback(
      (acceptedFiles: File[]) => {
        const newFiles = [...files, ...acceptedFiles];
        setFiles(newFiles);
        onChange?.(newFiles);
        onFilesAdded?.(acceptedFiles);
      },
      [files, onChange, onFilesAdded]
    );

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
      onDrop,
      disabled,
      ...dropzoneOptions,
    });

    return (
      <div
        {...getRootProps({
          className: cn(
            variants.base,
            isDragActive && variants.active,
            isDragAccept && variants.accept,
            isDragReject && variants.reject,
            disabled && variants.disabled,
            className
          ),
          style: {
            width,
            height,
          },
        })}
        ref={ref}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-xs text-muted-foreground p-2 text-center">
          <UploadCloud className="mb-1 h-6 w-6" />
          <div className="text-sm font-medium">Drag & drop files here</div>
          <div className="text-xs text-muted-foreground">or click to browse</div>
        </div>
      </div>
    );
  }
);

Dropzone.displayName = "Dropzone";

export { Dropzone };