'use client';

import { forwardRef, useEffect, useRef } from 'react';
import Quill, { Delta } from 'quill/core';
import 'quill/dist/quill.snow.css';

interface EditorProps {
	defaultValue?: Delta;
}

export const Editor = forwardRef<Quill | undefined, EditorProps>(
	({ defaultValue }, ref) => {
		const containerRef = useRef<HTMLDivElement>(null);
		useEffect(() => {
			const container = containerRef.current;

			if (!container) return;

			const quill = new Quill(container, {
				modules: {
					toolbar: '#toolbar',
				},
				theme: 'snow',
			});

			if (ref && typeof ref === 'object' && 'current' in ref) {
				ref.current = quill;
			}

			if (defaultValue) {
				quill.setContents(defaultValue);
			}

			// quill.focus();
			quill.setSelection(quill.getLength(), 0);

			// Cleanup function to ensure no memory leaks
			return () => {
				if (ref && typeof ref === 'object' && 'current' in ref) {
					ref.current = null;
				}
				container.innerHTML = '';
			};
		}, []);

		return (
			<>
				<div id="toolbar">
					<span className="ql-formats">
						<select className="ql-header">
							<option value="false"></option>
							<option value="1"></option>
							<option value="2"></option>
							<option value="3"></option>
							<option value="4"></option>
							<option value="5"></option>
							<option value="6"></option>
						</select>
					</span>
					<span className="ql-formats">
						<button className="ql-bold"></button>
						<button className="ql-italic"></button>
						<button className="ql-underline"></button>
						<button className="ql-strike"></button>
					</span>
					<span className="ql-formats">
						<button className="ql-list" value="ordered"></button>
						<button className="ql-list" value="bullet"></button>
					</span>
					<span className="ql-formats">
						<button className="ql-link"></button>
						<button className="ql-image"></button>
						<button className="ql-code-block"></button>
						<button className="ql-blockquote"></button>
					</span>
				</div>
				<div id="editor" ref={containerRef}></div>
			</>
		);
	}
);

Editor.displayName = 'Editor';
