"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Download,
  Trash2,
  Type,
  GripVertical,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { MemeTemplate } from "@/lib/meme-templates";

const SYSTEM_FONTS = [
  { label: "System Default", value: "system-ui, -apple-system, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Impact", value: "Impact, Haettenschweiler, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
] as const;

interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  fontWeight: "normal" | "bold";
  fontFamily: string;
}

function createTextBlock(x: number, y: number): TextBlock {
  return {
    id: crypto.randomUUID(),
    text: "Text goes here...",
    x,
    y,
    fontSize: 32,
    color: "#ffffff",
    strokeColor: "#000000",
    strokeWidth: 2,
    fontWeight: "bold",
    fontFamily: SYSTEM_FONTS[0].value,
  };
}

interface MemeEditorProps {
  template: MemeTemplate;
}

export function MemeEditor({ template }: MemeEditorProps) {
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([
    createTextBlock(50, 10),
    createTextBlock(50, 85),
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{
    blockId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });

  const selectedBlock =
    textBlocks.find((b) => b.id === selectedBlockId) ?? null;

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImageNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = template.image;
  }, [template.image]);

  useEffect(() => {
    if (editingBlockId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingBlockId]);

  const addTextBlock = useCallback(() => {
    const newBlock = createTextBlock(50, 50);
    setTextBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const updateTextBlock = useCallback(
    (id: string, updates: Partial<TextBlock>) => {
      setTextBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      );
    },
    [],
  );

  const deleteTextBlock = useCallback(
    (id: string) => {
      setTextBlocks((prev) => prev.filter((b) => b.id !== id));
      if (selectedBlockId === id) setSelectedBlockId(null);
      if (editingBlockId === id) setEditingBlockId(null);
    },
    [selectedBlockId, editingBlockId],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, blockId: string) => {
      if (editingBlockId === blockId) return;

      e.preventDefault();
      e.stopPropagation();
      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const block = textBlocks.find((b) => b.id === blockId);
      if (!block) return;

      const blockPxX = (block.x / 100) * rect.width;
      const blockPxY = (block.y / 100) * rect.height;

      setDragging({
        blockId,
        offsetX: e.clientX - rect.left - blockPxX,
        offsetY: e.clientY - rect.top - blockPxY,
      });
      setSelectedBlockId(blockId);
      setEditingBlockId(null);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [textBlocks, editingBlockId],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newX =
        ((e.clientX - rect.left - dragging.offsetX) / rect.width) * 100;
      const newY =
        ((e.clientY - rect.top - dragging.offsetY) / rect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, newX));
      const clampedY = Math.max(0, Math.min(100, newY));

      updateTextBlock(dragging.blockId, { x: clampedX, y: clampedY });
    },
    [dragging, updateTextBlock],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (!dragging) {
      setSelectedBlockId(null);
      setEditingBlockId(null);
    }
  }, [dragging]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent, blockId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingBlockId(blockId);
      setSelectedBlockId(blockId);
    },
    [],
  );

  const handleEditBlur = useCallback(() => {
    setEditingBlockId(null);
  }, []);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setEditingBlockId(null);
    }
    if (e.key === "Escape") {
      setEditingBlockId(null);
    }
  }, []);

  const downloadMeme = useCallback(async () => {
    const rect = canvasAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(template.image)}`;

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      canvas.width = naturalW;
      canvas.height = naturalH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, naturalW, naturalH);

      const scaleX = naturalW / rect.width;
      const scaleY = naturalH / rect.height;

      for (const block of textBlocks) {
        const pxX = (block.x / 100) * rect.width;
        const pxY = (block.y / 100) * rect.height;

        const canvasX = pxX * scaleX;
        const canvasY = pxY * scaleY;
        const scaledFontSize = block.fontSize * scaleX;

        ctx.font = `${block.fontWeight === "bold" ? "bold " : ""}${scaledFontSize}px ${block.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        if (block.strokeWidth > 0) {
          ctx.strokeStyle = block.strokeColor;
          ctx.lineWidth = block.strokeWidth * 2 * scaleX;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeText(block.text, canvasX, canvasY);
        }

        ctx.fillStyle = block.color;
        ctx.fillText(block.text, canvasX, canvasY);
      }

      const link = document.createElement("a");
      link.download = `meme-${template.id}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    };

    img.src = proxyUrl;
  }, [textBlocks, template]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b-2 border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Back</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-display text-base font-bold text-foreground sm:text-lg">
            {template.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addTextBlock}
            className="gap-2 rounded-xl bg-transparent border-2 font-semibold hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Text</span>
          </Button>
          <Button
            size="sm"
            onClick={downloadMeme}
            className="gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25 hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download JPG</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Canvas area */}
        <div className="flex flex-1 items-center justify-center bg-secondary/50 p-4 lg:p-8">
          <div
            ref={canvasAreaRef}
            className="relative max-h-[70vh] w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-border bg-foreground/5 shadow-2xl"
            style={{
              aspectRatio:
                imageNaturalSize.width && imageNaturalSize.height
                  ? `${imageNaturalSize.width}/${imageNaturalSize.height}`
                  : "4/3",
            }}
            onClick={handleCanvasClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="application"
            aria-label="Meme canvas editor"
          >
            <img
              src={template.image}
              alt={template.name}
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
              draggable={false}
            />

            {textBlocks.map((block) => {
              const isEditing = editingBlockId === block.id;
              const isSelected = selectedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  className={`absolute touch-none ${
                    isEditing
                      ? "cursor-text"
                      : dragging?.blockId === block.id
                        ? "cursor-grabbing"
                        : "cursor-grab"
                  } ${
                    isSelected && !isEditing
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent rounded-lg"
                      : ""
                  }`}
                  style={{
                    left: `${block.x}%`,
                    top: `${block.y}%`,
                    transform: "translate(-50%, 0)",
                    fontSize: `${block.fontSize}px`,
                    fontWeight: block.fontWeight,
                    fontFamily: block.fontFamily,
                    color: block.color,
                    WebkitTextStroke:
                      block.strokeWidth > 0
                        ? `${block.strokeWidth * 2}px ${block.strokeColor}`
                        : undefined,
                    paintOrder: "stroke fill",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    lineHeight: 1.1,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, block.id)}
                  onDoubleClick={(e) => handleDoubleClick(e, block.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Text block: ${block.text}. Double-click to edit.`}
                >
                  {isEditing ? (
                    <textarea
                      ref={editInputRef}
                      value={block.text}
                      onChange={(e) =>
                        updateTextBlock(block.id, { text: e.target.value })
                      }
                      onBlur={handleEditBlur}
                      onKeyDown={handleEditKeyDown}
                      className="resize-none border-none bg-transparent p-0 text-center outline-none ring-2 ring-primary rounded-lg"
                      style={{
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        fontFamily: "inherit",
                        color: "inherit",
                        WebkitTextStroke: "inherit",
                        lineHeight: "inherit",
                        width: `${Math.max(block.text.length * 0.6, 3)}em`,
                        minWidth: "3em",
                        height: "1.4em",
                        caretColor: block.color,
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="select-none">{block.text}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 border-t-2 border-border bg-card lg:w-80 lg:border-l-2 lg:border-t-0 xl:w-96">
          <div className="flex h-full flex-col">
            {/* Block list */}
            <div className="border-b-2 border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-foreground">
                  Text Layers
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addTextBlock}
                  className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  aria-label="Add text layer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
                {textBlocks.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No text layers yet. Click + to add one.
                  </p>
                )}
                {textBlocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      selectedBlockId === block.id
                        ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    onClick={() => setSelectedBlockId(block.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setSelectedBlockId(block.id);
                    }}
                  >
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    <Type className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate font-medium">
                      {block.text || `Text ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextBlock(block.id);
                      }}
                      className="hidden h-6 w-6 items-center justify-center rounded-lg text-destructive opacity-0 transition-opacity group-hover:flex group-hover:opacity-100 hover:bg-destructive/10"
                      aria-label={`Delete text block ${idx + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties panel */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedBlock ? (
                <div className="flex flex-col gap-5">
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Properties
                  </h3>

                  <div className="flex items-center gap-2.5 rounded-xl bg-primary/5 border border-primary/15 px-3.5 py-2.5">
                    <MousePointerClick className="h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs font-medium text-primary">
                      Double-click text on the canvas to edit it.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Font Family
                    </Label>
                    <select
                      value={selectedBlock.fontFamily}
                      onChange={(e) =>
                        updateTextBlock(selectedBlock.id, {
                          fontFamily: e.target.value,
                        })
                      }
                      className="h-10 w-full rounded-xl border-2 border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {SYSTEM_FONTS.map((font) => (
                        <option
                          key={font.value}
                          value={font.value}
                          style={{ fontFamily: font.value }}
                        >
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Font Size: {selectedBlock.fontSize}px
                    </Label>
                    <Slider
                      value={[selectedBlock.fontSize]}
                      onValueChange={([val]) =>
                        updateTextBlock(selectedBlock.id, { fontSize: val })
                      }
                      min={12}
                      max={80}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="text-color"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        Fill Color
                      </Label>
                      <div className="flex items-center gap-2.5">
                        <input
                          id="text-color"
                          type="color"
                          value={selectedBlock.color}
                          onChange={(e) =>
                            updateTextBlock(selectedBlock.id, {
                              color: e.target.value,
                            })
                          }
                          className="h-9 w-9 cursor-pointer rounded-xl border-2 border-border bg-transparent p-0.5"
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {selectedBlock.color}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="stroke-color"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        Stroke Color
                      </Label>
                      <div className="flex items-center gap-2.5">
                        <input
                          id="stroke-color"
                          type="color"
                          value={selectedBlock.strokeColor}
                          onChange={(e) =>
                            updateTextBlock(selectedBlock.id, {
                              strokeColor: e.target.value,
                            })
                          }
                          className="h-9 w-9 cursor-pointer rounded-xl border-2 border-border bg-transparent p-0.5"
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {selectedBlock.strokeColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Stroke Width: {selectedBlock.strokeWidth}px
                    </Label>
                    <Slider
                      value={[selectedBlock.strokeWidth]}
                      onValueChange={([val]) =>
                        updateTextBlock(selectedBlock.id, {
                          strokeWidth: val,
                        })
                      }
                      min={0}
                      max={8}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Font Weight
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          selectedBlock.fontWeight === "normal"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateTextBlock(selectedBlock.id, {
                            fontWeight: "normal",
                          })
                        }
                        className={`flex-1 rounded-xl font-medium ${selectedBlock.fontWeight === "normal" ? "bg-primary text-primary-foreground" : "bg-transparent border-2"}`}
                      >
                        Normal
                      </Button>
                      <Button
                        variant={
                          selectedBlock.fontWeight === "bold"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateTextBlock(selectedBlock.id, {
                            fontWeight: "bold",
                          })
                        }
                        className={`flex-1 rounded-xl font-bold ${selectedBlock.fontWeight === "bold" ? "bg-primary text-primary-foreground" : "bg-transparent border-2"}`}
                      >
                        Bold
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTextBlock(selectedBlock.id)}
                    className="mt-2 gap-2 rounded-xl font-semibold"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Text Block
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                    <Type className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    No text selected
                  </p>
                  <p className="mt-1.5 max-w-[200px] text-xs text-muted-foreground leading-relaxed">
                    Click on a text block in the canvas to edit its properties
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
