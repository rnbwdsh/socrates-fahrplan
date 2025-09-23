/**
 * This file was @generated using pocketbase-typegen
 */
import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
	Authorigins = '_authOrigins',
	Externalauths = '_externalAuths',
	Mfas = '_mfas',
	Otps = '_otps',
	Superusers = '_superusers',
	Room = 'room',
	Tag = 'tag',
	Talk = 'talk',
	Users = 'users',
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T };

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString;
	collectionId: string;
	collectionName: Collections;
} & ExpandType<T>;

export type AuthSystemFields<T = unknown> = {
	email: string;
	emailVisibility: boolean;
	username: string;
	verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string;
	created?: IsoDateString;
	fingerprint: string;
	id: string;
	recordRef: string;
	updated?: IsoDateString;
};

export type ExternalauthsRecord = {
	collectionRef: string;
	created?: IsoDateString;
	id: string;
	provider: string;
	providerId: string;
	recordRef: string;
	updated?: IsoDateString;
};

export type MfasRecord = {
	collectionRef: string;
	created?: IsoDateString;
	id: string;
	method: string;
	recordRef: string;
	updated?: IsoDateString;
};

export type OtpsRecord = {
	collectionRef: string;
	created?: IsoDateString;
	id: string;
	password: string;
	recordRef: string;
	sentTo?: string;
	updated?: IsoDateString;
};

export type SuperusersRecord = {
	created?: IsoDateString;
	email: string;
	emailVisibility?: boolean;
	id: string;
	password: string;
	tokenKey: string;
	updated?: IsoDateString;
	verified?: boolean;
};

export type RoomRecord = {
	created?: IsoDateString;
	floor?: string;
	id: string;
	name?: string;
	updated?: IsoDateString;
};

export type TagRecord = {
	created?: IsoDateString;
	id: string;
	name?: string;
	updated?: IsoDateString;
};

export enum TalkLanguageOptions {
	'english' = 'english',
	'german' = 'german',
}
export type TalkRecord = {
	created?: IsoDateString;
	description?: string;
	durationMinutes: number;
	files?: string[];
	id: string;
	language?: TalkLanguageOptions;
	name: string;
	room: RecordIdString;
	speaker?: RecordIdString[];
	start: IsoDateString;
	tags?: RecordIdString[];
	updated?: IsoDateString;
};

export type UsersRecord = {
	avatar?: string;
	bio?: string;
	created?: IsoDateString;
	email: string;
	emailVisibility?: boolean;
	id: string;
	name?: string;
	password: string;
	talksToVisit?: RecordIdString[];
	tokenKey: string;
	updated?: IsoDateString;
	verified?: boolean;
	website?: string;
};

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> &
	BaseSystemFields<Texpand>;
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> &
	BaseSystemFields<Texpand>;
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>;
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>;
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> &
	AuthSystemFields<Texpand>;
export type RoomResponse<Texpand = unknown> = Required<RoomRecord> & BaseSystemFields<Texpand>;
export type TagResponse<Texpand = unknown> = Required<TagRecord> & BaseSystemFields<Texpand>;
export type TalkResponse<Texpand = unknown> = Required<TalkRecord> & BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord;
	_externalAuths: ExternalauthsRecord;
	_mfas: MfasRecord;
	_otps: OtpsRecord;
	_superusers: SuperusersRecord;
	room: RoomRecord;
	tag: TagRecord;
	talk: TalkRecord;
	users: UsersRecord;
};

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse;
	_externalAuths: ExternalauthsResponse;
	_mfas: MfasResponse;
	_otps: OtpsResponse;
	_superusers: SuperusersResponse;
	room: RoomResponse;
	tag: TagResponse;
	talk: TalkResponse;
	users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>;
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>;
	collection(idOrName: '_mfas'): RecordService<MfasResponse>;
	collection(idOrName: '_otps'): RecordService<OtpsResponse>;
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>;
	collection(idOrName: 'room'): RecordService<RoomResponse>;
	collection(idOrName: 'tag'): RecordService<TagResponse>;
	collection(idOrName: 'talk'): RecordService<TalkResponse>;
	collection(idOrName: 'users'): RecordService<UsersResponse>;
};
