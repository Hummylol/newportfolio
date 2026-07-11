'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface LineTextGLProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const LineTextGL = forwardRef<HTMLDivElement, LineTextGLProps>(
  ({ text, className, style }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    // Forward the containerRef to the parent ref
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const textEl = textRef.current;
      if (!container || !canvas || !textEl) return;

      let renderer: THREE.WebGLRenderer;
      let scene: THREE.Scene;
      let camera: THREE.OrthographicCamera;
      let plane: THREE.Mesh;
      let texture: THREE.CanvasTexture;
      let material: THREE.ShaderMaterial;
      let textCanvas: HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D | null;

      const drawText = (isDark: boolean) => {
        if (!ctx || !textCanvas || !textEl || !container) return;
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        ctx.clearRect(0, 0, width, height);

        const styleEl = window.getComputedStyle(textEl);
        const font = styleEl.fontFamily;
        const weight = styleEl.fontWeight;
        const fontSize = styleEl.fontSize;
        const letterSpacing = styleEl.letterSpacing;
        const color = styleEl.color;
        const parentColor = container ? window.getComputedStyle(container).color : 'no container';
        const sectionColor = document.getElementById('hero-section') ? window.getComputedStyle(document.getElementById('hero-section')!).color : 'no section';

        console.log(`[LineTextGL Debug] text: "${text}", isDark: ${isDark}, styleEl: "${color}", parent: "${parentColor}", section: "${sectionColor}", classList: "${document.documentElement.className}"`);

        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = color || (isDark ? '#ffffff' : '#000000');

        ctx.font = `${weight} ${fontSize} ${font}`;
        if ('letterSpacing' in ctx) {
          (ctx as any).letterSpacing = letterSpacing;
        }

        const paddingTop = parseFloat(styleEl.paddingTop) || 0;
        const paddingLeft = parseFloat(styleEl.paddingLeft) || 0;
        ctx.fillText(text, paddingLeft, paddingTop);

        if (texture) texture.needsUpdate = true;
      };

      const init = () => {
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (width === 0 || height === 0) return;

        textCanvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        textCanvas.width = width * dpr;
        textCanvas.height = height * dpr;
        ctx = textCanvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        const isDark = document.documentElement.classList.contains('dark');
        drawText(isDark);

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(
          -width / 2,
          width / 2,
          height / 2,
          -height / 2,
          0.1,
          10
        );
        camera.position.z = 1;

        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        texture = new THREE.CanvasTexture(textCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const vertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;

        const fragmentShader = `
          uniform sampler2D uTexture;
          varying vec2 vUv;
          uniform vec2 uMouse;
          uniform float uHover;
          void main() {
            float block = 32.0;
            vec2 blockUv = floor(vUv * block) / block;
            float distance = length(blockUv - uMouse);
            float effect = smoothstep(0.3, 0.0, distance);
            vec2 distortion = vec2(0.035) * effect;
            vec4 color = texture2D(uTexture, vUv + (distortion * uHover));
            gl_FragColor = color;
          }
        `;

        material = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: texture },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uHover: { value: 0 },
          },
          vertexShader,
          fragmentShader,
          transparent: true,
        });

        const geometry = new THREE.PlaneGeometry(width, height);
        plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
      };

      const handleResize = () => {
        if (!container || !renderer || !camera || !plane || !textCanvas) return;
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (width === 0 || height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        textCanvas.width = width * dpr;
        textCanvas.height = height * dpr;
        if (ctx) {
          ctx.scale(dpr, dpr);
          const isDark = document.documentElement.classList.contains('dark');
          drawText(isDark);
        }

        camera.left = -width / 2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        plane.geometry.dispose();
        plane.geometry = new THREE.PlaneGeometry(width, height);

        renderer.setSize(width, height);
      };

      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            if (!renderer) {
              init();
            } else {
              handleResize();
            }
          }
        }
      });
      resizeObserver.observe(container);

      if (typeof document !== 'undefined') {
        document.fonts.ready.then(() => {
          const isDark = document.documentElement.classList.contains('dark');
          drawText(isDark);
        });
      }

      const themeObserver = new MutationObserver(() => {
        const isDark = document.documentElement.classList.contains('dark');
        drawText(isDark);
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      const onMouseMove = (e: MouseEvent) => {
        if (!material) return;
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;

        gsap.to(material.uniforms.uMouse.value, {
          x: x,
          y: y,
          duration: 0.35,
          ease: 'power2.out',
        });
      };

      const onMouseEnter = () => {
        if (!material) return;
        gsap.to(material.uniforms.uHover, {
          value: 1,
          duration: 0.5,
          ease: 'power2.out',
        });
      };

      const onMouseLeave = () => {
        if (!material) return;
        gsap.to(material.uniforms.uHover, {
          value: 0,
          duration: 0.7,
          ease: 'power2.out',
        });
      };

      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseenter', onMouseEnter);
      container.addEventListener('mouseleave', onMouseLeave);

      let animationFrameId: number;
      const renderLoop = () => {
        animationFrameId = requestAnimationFrame(renderLoop);
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      renderLoop();

      return () => {
        resizeObserver.disconnect();
        themeObserver.disconnect();
        cancelAnimationFrame(animationFrameId);

        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseenter', onMouseEnter);
        container.removeEventListener('mouseleave', onMouseLeave);

        if (renderer) renderer.dispose();
        if (texture) texture.dispose();
        if (material) material.dispose();
      };
    }, [text]);

    return (
      <div ref={containerRef} className="relative w-fit">
        {/* paddingTop expands the canvas height AND shifts the draw origin down
            so Qinferly ascenders aren't clipped by the canvas top edge */}
        <div
          ref={textRef}
          className={className}
          style={{
            ...style,
            paddingTop: '0.24em',
            opacity: 0,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>

        {/* Three.js WebGL Canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      </div>
    );
  }
);

LineTextGL.displayName = 'LineTextGL';

export default LineTextGL;
