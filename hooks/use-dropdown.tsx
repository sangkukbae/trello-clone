import { useState, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

export const useDropdown = <T extends unknown>(initialState: T) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentMenu, setCurrentMenu] = useState(initialState);
	const dropdownContentRef = useRef(null);

	useOnClickOutside(dropdownContentRef, () => {
		setIsOpen(false);
		setCurrentMenu('none' as T);
	});

	return { isOpen, setIsOpen, currentMenu, setCurrentMenu, dropdownContentRef };
};
