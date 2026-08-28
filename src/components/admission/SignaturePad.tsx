"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 전자서명 입력칸. (18단계)
 *
 * ## 왜 라이브러리를 쓰지 않는가
 *
 * 필요한 것은 "누른 채 움직인 자취를 선으로 긋고 PNG 로 내보내기" 뿐이다.
 * `<canvas>` 와 Pointer Events 로 충분하며, 이 프로젝트는 런타임 의존성이 9개뿐이라
 * 이 기능 하나로 늘리지 않는다. (CLAUDE.md 2항 — 외부 라이브러리를 과하게 추가하지 않는다)
 *
 * ## Pointer Events 를 쓰는 이유
 *
 * mouse / touch 두 벌을 따로 처리하면 PC 와 모바일에서 코드가 갈라진다.
 * Pointer Events 는 마우스·터치·펜을 한 벌로 다루고, 최신 브라우저에서 모두 동작한다.
 * `touch-action: none` 이 없으면 모바일에서 서명 대신 화면이 스크롤된다.
 *
 * ## 저장 형식
 *
 * `canvas.toDataURL("image/png")` 결과를 hidden input 에 넣어 폼과 함께 보낸다.
 * 서버는 접두사만 믿지 않고 **디코딩 후 magic byte 로 PNG 인지 다시 확인한다.**
 * (`parseSignatureDataUrl`)
 *
 * 획 좌표(stroke JSON)는 저장하지 않는다. 이번 단계 범위가 아니다.
 */

/** 표시 크기(CSS 픽셀). 실제 캔버스는 화면 배율만큼 키워 선명하게 그린다. */
const WIDTH = 600;
const HEIGHT = 180;
const LINE_WIDTH = 2.2;

export function SignaturePad({
  name,
  label,
  hint,
  clearLabel,
  doneLabel,
  error,
  disabled,
  onSigned,
}: {
  /** hidden input 의 name. 서버 액션이 이 이름으로 읽는다. */
  name: string;
  label: string;
  hint: string;
  clearLabel: string;
  doneLabel: string;
  error?: string;
  disabled?: boolean;
  /** 서명이 생기거나 지워졌을 때. 부모가 오류 표시를 지우는 데 쓴다. */
  onSigned?: (hasSignature: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  /** 화면 배율에 맞춰 캔버스 해상도를 잡는다. 이 작업이 캔버스를 비우므로 한 번만 한다. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = WIDTH * ratio;
    canvas.height = HEIGHT * ratio;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(ratio, ratio);
    context.lineWidth = LINE_WIDTH;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#14181f";
  }, []);

  const positionOf = (
    canvas: HTMLCanvasElement,
    event: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    const rect = canvas.getBoundingClientRect();
    // 캔버스가 화면 폭에 맞춰 줄어들 수 있으므로 표시 크기 기준으로 환산한다.
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const commit = useCallback(() => {
    const canvas = canvasRef.current;
    const input = inputRef.current;
    if (!canvas || !input) return;

    // state 대신 DOM 을 직접 갱신한다. 획을 그을 때마다 재렌더하지 않기 위해서다.
    input.value = canvas.toDataURL("image/png");

    if (!hasSignature) {
      setHasSignature(true);
      onSigned?.(true);
    }
  }, [hasSignature, onSigned]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    // 캔버스 밖으로 나가도 획이 이어지도록 포인터를 붙잡는다.
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;

    const { x, y } = positionOf(canvas, event);
    context.beginPath();
    context.moveTo(x, y);
    // 점 하나만 찍어도 서명으로 남게 한다.
    context.lineTo(x, y);
    context.stroke();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const { x, y } = positionOf(canvas, event);
    context.lineTo(x, y);
    context.stroke();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
    commit();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    // 배율 변환이 걸려 있으므로 표시 크기 기준으로 지운다.
    context.clearRect(0, 0, WIDTH, HEIGHT);

    if (inputRef.current) inputRef.current.value = "";
    setHasSignature(false);
    onSigned?.(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <button
          type="button"
          onClick={clear}
          disabled={disabled || !hasSignature}
          className="text-xs font-medium text-muted underline-offset-4 hover:text-navy hover:underline disabled:cursor-not-allowed disabled:text-muted/50 disabled:no-underline"
        >
          {clearLabel}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label={label}
        className={cn(
          // touch-none: 모바일에서 서명 중 화면이 스크롤되지 않게 한다.
          "h-[180px] w-full max-w-[600px] touch-none rounded-md border bg-background",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-crosshair",
          error ? "border-[#b3261e]" : "border-line",
        )}
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
      />

      <input ref={inputRef} type="hidden" name={name} defaultValue="" />

      <p className="text-xs leading-relaxed text-muted">
        {hasSignature ? doneLabel : hint}
      </p>

      {error && (
        <p className="text-xs font-medium text-[#b3261e]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
