import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Region {
    id: bigint;
    code: string;
    name: string;
}
export type Time = bigint;
export interface Attendance {
    checkIn: Time;
    checkOut: Time;
    photo: ExternalBlob;
}
export interface School {
    id: bigint;
    region: Region;
    submissionsCount: bigint;
    name: string;
    isActive: boolean;
    lastSubmissionDate?: Time;
    principalId: Principal;
    schoolCategory: SchoolCategory;
}
export interface Submission {
    id: bigint;
    classControl: boolean;
    problemSolving: string;
    teacherControl: boolean;
    date: Time;
    programExecution: boolean;
    parentResponse: boolean;
    score: bigint;
    schoolId: bigint;
    attendance?: Attendance;
    category: SubmissionCategory;
    principalId: Principal;
}
export interface UserProfile {
    region: Region;
    displayName: string;
    role: string;
    schoolName: string;
}
export enum SchoolCategory {
    sd = "sd",
    smk = "smk",
    smp = "smp",
    smaK = "smaK"
}
export enum SubmissionCategory {
    classControl = "classControl",
    problemSolving = "problemSolving",
    teacherControl = "teacherControl",
    programExecution = "programExecution",
    parentResponse = "parentResponse",
    attendance = "attendance"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignKepsekProfile(kepsekPrincipal: Principal, displayName: string, schoolName: string, region: Region): Promise<void>;
    createSchool(name: string, region: Region, schoolCategory: SchoolCategory, principalId: Principal): Promise<bigint>;
    createSubmission(schoolId: bigint, attendance: Attendance | null, classControl: boolean, teacherControl: boolean, parentResponse: boolean, programExecution: boolean, problemSolving: string): Promise<bigint>;
    getActiveSchools(): Promise<Array<School>>;
    getAllSubmissions(): Promise<Array<Submission>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        totalActiveSchools: bigint;
        submissionsToday: bigint;
        averageScore: bigint;
    }>;
    getMySubmissions(): Promise<Array<Submission>>;
    getSchoolDetails(schoolId: bigint): Promise<{
        school: School;
        recentSubmissions: Array<Submission>;
    }>;
    getSchoolsByRegion(regionId: bigint): Promise<Array<School>>;
    getSubmissionsBySchool(schoolId: bigint): Promise<Array<Submission>>;
    getTopSchools(limit: bigint): Promise<Array<School>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateSchool(schoolId: bigint, name: string, region: Region, schoolCategory: SchoolCategory, principalId: Principal, isActive: boolean): Promise<void>;
}
