import { Attachment, Card } from '@prisma/client';

export interface Label {
	title: string;
	color: string;
	checked: boolean;
}

export interface ImageInfo {
	id: string;
	imageThumbUrl: string;
	imageFullUrl: string;
	imageUserName: string;
	imageLinkHtml: string;
}

export interface Checklist {
	title: string;
	isEditing: boolean;
	items: ChecklistItem[];
}

export interface ChecklistItem {
	task: string;
	checked: boolean;
	isEditing: boolean;
}

export interface CardType extends Card {
	attachments: Attachment[];
}
