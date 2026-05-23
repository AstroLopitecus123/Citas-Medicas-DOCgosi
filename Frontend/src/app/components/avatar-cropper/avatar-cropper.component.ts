import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-avatar-cropper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avatar-cropper.component.html',
  styleUrls: ['./avatar-cropper.component.css'],
})
export class AvatarCropperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() imageFile: File | null = null;
  @Output() cropBlob = new EventEmitter<Blob>();
  @Output() cancelar = new EventEmitter<void>();

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Canvas size
  readonly CANVAS_SIZE = 320;
  readonly CIRCLE_RADIUS = 130;

  private ctx!: CanvasRenderingContext2D;
  private img = new Image();
  private imgLoaded = false;

  // Position of the image (center of image relative to canvas center)
  private offsetX = 0;
  private offsetY = 0;

  // Zoom
  zoom = 1;

  // Natural dimensions of the image
  private imgNaturalW = 0;
  private imgNaturalH = 0;

  // Drag state
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private offsetStartX = 0;
  private offsetStartY = 0;

  // Bound event handlers (for cleanup)
  private onMouseMoveBound!: (e: MouseEvent) => void;
  private onMouseUpBound!: (e: MouseEvent) => void;
  private onTouchMoveBound!: (e: TouchEvent) => void;
  private onTouchEndBound!: (e: TouchEvent) => void;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.setupEventListeners();
    if (this.imageFile) {
      this.loadImage(this.imageFile);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['imageFile'] && this.imageFile && this.ctx) {
      this.loadImage(this.imageFile);
    }
  }

  ngOnDestroy() {
    this.removeGlobalListeners();
  }

  private loadImage(file: File) {
    const url = URL.createObjectURL(file);
    this.img = new Image();
    this.img.onload = () => {
      this.imgNaturalW = this.img.naturalWidth;
      this.imgNaturalH = this.img.naturalHeight;
      this.imgLoaded = true;

      // Calculate initial zoom so the image fills the circle
      const minDim = Math.min(this.imgNaturalW, this.imgNaturalH);
      const neededSize = this.CIRCLE_RADIUS * 2;
      this.zoom = neededSize / minDim;
      if (this.zoom < 1) this.zoom = 1;

      // Center the image
      this.offsetX = 0;
      this.offsetY = 0;

      URL.revokeObjectURL(url);
      this.draw();
    };
    this.img.src = url;
  }

  private setupEventListeners() {
    const canvas = this.canvasRef.nativeElement;

    this.onMouseMoveBound = (e) => this.onMouseMove(e);
    this.onMouseUpBound = (e) => this.onMouseUp(e);
    this.onTouchMoveBound = (e) => this.onTouchMove(e);
    this.onTouchEndBound = (e) => this.onTouchEnd(e);

    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
  }

  private removeGlobalListeners() {
    document.removeEventListener('mousemove', this.onMouseMoveBound);
    document.removeEventListener('mouseup', this.onMouseUpBound);
    document.removeEventListener('touchmove', this.onTouchMoveBound);
    document.removeEventListener('touchend', this.onTouchEndBound);
  }

  private onMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.dragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.offsetStartX = this.offsetX;
    this.offsetStartY = this.offsetY;
    document.addEventListener('mousemove', this.onMouseMoveBound);
    document.addEventListener('mouseup', this.onMouseUpBound);
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.dragging) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.offsetX = this.offsetStartX + dx;
    this.offsetY = this.offsetStartY + dy;
    this.clampOffset();
    this.draw();
  }

  private onMouseUp(_e: MouseEvent) {
    this.dragging = false;
    document.removeEventListener('mousemove', this.onMouseMoveBound);
    document.removeEventListener('mouseup', this.onMouseUpBound);
  }

  private onTouchStart(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.dragging = true;
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;
      this.offsetStartX = this.offsetX;
      this.offsetStartY = this.offsetY;
      document.addEventListener('touchmove', this.onTouchMoveBound, { passive: false });
      document.addEventListener('touchend', this.onTouchEndBound);
    }
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (!this.dragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - this.dragStartX;
    const dy = e.touches[0].clientY - this.dragStartY;
    this.offsetX = this.offsetStartX + dx;
    this.offsetY = this.offsetStartY + dy;
    this.clampOffset();
    this.draw();
  }

  private onTouchEnd(_e: TouchEvent) {
    this.dragging = false;
    document.removeEventListener('touchmove', this.onTouchMoveBound);
    document.removeEventListener('touchend', this.onTouchEndBound);
  }

  onZoomChange() {
    this.clampOffset();
    this.draw();
  }

  /** Clamp offsetX/Y so the image always covers the circle */
  private clampOffset() {
    if (!this.imgLoaded) return;

    const scaledW = this.imgNaturalW * this.zoom;
    const scaledH = this.imgNaturalH * this.zoom;
    const cx = this.CANVAS_SIZE / 2;
    const cy = this.CANVAS_SIZE / 2;

    // Left edge of image must be <= cx - CIRCLE_RADIUS
    // Right edge of image must be >= cx + CIRCLE_RADIUS
    const imgLeft = cx + this.offsetX - scaledW / 2;
    const imgRight = cx + this.offsetX + scaledW / 2;
    const imgTop = cy + this.offsetY - scaledH / 2;
    const imgBottom = cy + this.offsetY + scaledH / 2;

    const maxLeft = cx - this.CIRCLE_RADIUS;
    const minRight = cx + this.CIRCLE_RADIUS;
    const maxTop = cy - this.CIRCLE_RADIUS;
    const minBottom = cy + this.CIRCLE_RADIUS;

    if (imgLeft > maxLeft) {
      this.offsetX -= imgLeft - maxLeft;
    }
    if (imgRight < minRight) {
      this.offsetX += minRight - imgRight;
    }
    if (imgTop > maxTop) {
      this.offsetY -= imgTop - maxTop;
    }
    if (imgBottom < minBottom) {
      this.offsetY += minBottom - imgBottom;
    }
  }

  private draw() {
    if (!this.imgLoaded || !this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const size = this.CANVAS_SIZE;
    const cx = size / 2;
    const cy = size / 2;
    const r = this.CIRCLE_RADIUS;

    ctx.clearRect(0, 0, size, size);

    // Draw image (no clipping yet — full canvas)
    const scaledW = this.imgNaturalW * this.zoom;
    const scaledH = this.imgNaturalH * this.zoom;
    const ix = cx + this.offsetX - scaledW / 2;
    const iy = cy + this.offsetY - scaledH / 2;

    ctx.drawImage(this.img, ix, iy, scaledW, scaledH);

    // Dark overlay outside the circle
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.arc(cx, cy, r, 0, Math.PI * 2, true); // cutout (counter-clockwise)
    ctx.fill('evenodd');
    ctx.restore();

    // Circle border
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  confirmar() {
    if (!this.imgLoaded) return;

    // Export only the circle content to a 256x256 canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 256;
    exportCanvas.height = 256;
    const ectx = exportCanvas.getContext('2d')!;

    const size = this.CANVAS_SIZE;
    const cx = size / 2;
    const cy = size / 2;
    const r = this.CIRCLE_RADIUS;

    // Source rect (the circle area in the main canvas)
    const srcX = cx - r;
    const srcY = cy - r;
    const srcSize = r * 2;

    ectx.drawImage(
      this.canvasRef.nativeElement,
      srcX, srcY, srcSize, srcSize,
      0, 0, 256, 256
    );

    exportCanvas.toBlob((blob) => {
      if (blob) {
        this.cropBlob.emit(blob);
      }
    }, 'image/png');
  }

  onCancelar() {
    this.cancelar.emit();
  }
}
