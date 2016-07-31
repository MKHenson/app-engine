declare module Animate {
	export interface PortalToken {
		name: string;
		type: string;
		dataType: string;
		value: any;
	}

	export interface LinkToken {
		id: string;
		type: string;
		startPortal: string;
		endPortal: string;
		startBehaviour: string;
		endBehaviour: string;
		frameDelay: number;
	}

	export interface BehaviourToken {
		id: string;
		name: string;
		type: string;

		portals: Array<PortalToken>;

		// Portal behaviours
		portalType: string;
		dataType: string;
		value: any;

		// Behaviour Instances
		originalContainerID: number;

		// Behaviour Script
		shallowId: number;
	}

	export interface ContainerToken	{
		name: string;
		id: any;
		behaviours: Array<BehaviourToken>;
		links: Array<LinkToken>;
		assets: Array<number>;
		groups: Array<string>;
		properties: {};
		plugins: {};
	}

	export interface GroupToken {
		name: string;
        id: string;
        items: Array<number>
	}

	export interface AssetToken {
		name: string;
		id: number;
		properties: { [name: string]: any };
		className: string;
		assets: Array<number>;
	}

	export interface ExportToken {
		assets: Array<AssetToken>;
		groups: Array<GroupToken>;
		containers: Array<ContainerToken>;
		converters: {};
		data: {};
	}
}