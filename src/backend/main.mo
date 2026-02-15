import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import List "mo:core/List";
import Bool "mo:core/Bool";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type Attendance = {
    checkIn : Time.Time;
    checkOut : Time.Time;
    photo : Storage.ExternalBlob;
  };

  public type SchoolCategory = {
    #sd;
    #smp;
    #smaK;
    #smk;
  };

  public type Region = {
    id : Nat;
    name : Text;
    code : Text;
  };

  public type ProgramStatus = {
    #inProgress;
    #completed;
    #onHold;
  };

  public type Program = {
    id : Nat;
    name : Text;
    status : ?ProgramStatus;
    startDate : Time.Time;
    endDate : ?Time.Time;
  };

  public type SubmissionCategory = {
    #attendance;
    #classControl;
    #teacherControl;
    #parentResponse;
    #programExecution;
    #problemSolving;
  };

  public type Submission = {
    id : Nat;
    principalId : Principal;
    schoolId : Nat;
    date : Time.Time;
    attendance : ?Attendance;
    classControl : Bool;
    teacherControl : Bool;
    parentResponse : Bool;
    programExecution : Bool;
    problemSolving : Text;
    score : Nat;
    category : SubmissionCategory;
  };

  public type UserProfile = {
    displayName : Text;
    schoolName : Text;
    region : Region;
    role : Text; // "director" or "kepsek"
  };

  var nextUserId = 0;
  var nextSubmissionId = 0;

  public type School = {
    id : Nat;
    name : Text;
    region : Region;
    schoolCategory : SchoolCategory;
    principalId : Principal;
    isActive : Bool;
    submissionsCount : Nat;
    lastSubmissionDate : ?Time.Time;
  };

  let schools = Map.empty<Nat, School>();
  let submissions = Map.empty<Nat, Submission>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module School {
    public func compare(a : School, b : School) : Order.Order {
      Nat.compare(b.submissionsCount, a.submissionsCount);
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only: Assign Kepsek profile and role
  public shared ({ caller }) func assignKepsekProfile(
    kepsekPrincipal : Principal,
    displayName : Text,
    schoolName : Text,
    region : Region,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can assign Kepsek profiles");
    };

    // Assign user role to the Kepsek
    AccessControl.assignRole(accessControlState, caller, kepsekPrincipal, #user);

    // Create profile
    let profile : UserProfile = {
      displayName;
      schoolName;
      region;
      role = "kepsek";
    };
    userProfiles.add(kepsekPrincipal, profile);
  };

  // Admin-only: Create or update school
  public shared ({ caller }) func createSchool(
    name : Text,
    region : Region,
    schoolCategory : SchoolCategory,
    principalId : Principal,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can create schools");
    };

    let schoolId = schools.size();
    let school : School = {
      id = schoolId;
      name;
      region;
      schoolCategory;
      principalId;
      isActive = true;
      submissionsCount = 0;
      lastSubmissionDate = null;
    };
    schools.add(schoolId, school);
    schoolId;
  };

  // Admin-only: Update school
  public shared ({ caller }) func updateSchool(
    schoolId : Nat,
    name : Text,
    region : Region,
    schoolCategory : SchoolCategory,
    principalId : Principal,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can update schools");
    };

    switch (schools.get(schoolId)) {
      case (null) {
        Runtime.trap("School not found");
      };
      case (?existingSchool) {
        let updatedSchool : School = {
          id = schoolId;
          name;
          region;
          schoolCategory;
          principalId;
          isActive;
          submissionsCount = existingSchool.submissionsCount;
          lastSubmissionDate = existingSchool.lastSubmissionDate;
        };
        schools.add(schoolId, updatedSchool);
      };
    };
  };

  // Kepsek: Submit daily form (user must own the school)
  public shared ({ caller }) func createSubmission(
    schoolId : Nat,
    attendance : ?Attendance,
    classControl : Bool,
    teacherControl : Bool,
    parentResponse : Bool,
    programExecution : Bool,
    problemSolving : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only Kepsek users can create submissions");
    };

    // Verify ownership: caller must be the principal of the school
    switch (schools.get(schoolId)) {
      case (null) {
        Runtime.trap("School not found");
      };
      case (?school) {
        if (school.principalId != caller) {
          Runtime.trap("Unauthorized: You can only submit for your own school");
        };

        // Calculate score: 5 categories × 20 points each = 100 max
        var score = 0;
        if (attendance != null) { score += 20 };
        if (classControl) { score += 20 };
        if (teacherControl) { score += 20 };
        if (parentResponse) { score += 20 };
        if (programExecution) { score += 20 };

        let submissionId = nextSubmissionId;
        nextSubmissionId += 1;

        let submission : Submission = {
          id = submissionId;
          principalId = caller;
          schoolId;
          date = Time.now();
          attendance;
          classControl;
          teacherControl;
          parentResponse;
          programExecution;
          problemSolving;
          score;
          category = #attendance; // Default category
        };

        submissions.add(submissionId, submission);

        // Update school stats
        let updatedSchool : School = {
          id = school.id;
          name = school.name;
          region = school.region;
          schoolCategory = school.schoolCategory;
          principalId = school.principalId;
          isActive = school.isActive;
          submissionsCount = school.submissionsCount + 1;
          lastSubmissionDate = ?Time.now();
        };
        schools.add(schoolId, updatedSchool);

        submissionId;
      };
    };
  };

  // Admin: Get all submissions (Director/Management dashboard)
  public query ({ caller }) func getAllSubmissions() : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can view all submissions");
    };
    submissions.values().toArray();
  };

  // Kepsek: Get own submissions only
  public query ({ caller }) func getMySubmissions() : async [Submission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view submissions");
    };

    let allSubmissions = submissions.values().toArray();
    allSubmissions.filter(func(submission) { submission.principalId == caller });
  };

  // Admin: Get submissions by school (for detail view)
  public query ({ caller }) func getSubmissionsBySchool(schoolId : Nat) : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can view school submissions");
    };

    let allSubmissions = submissions.values().toArray();
    allSubmissions.filter(func(submission) { submission.schoolId == schoolId });
  };

  // Admin: Get top schools (leaderboard)
  public query ({ caller }) func getTopSchools(limit : Nat) : async [School] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can view leaderboard");
    };

    let activeSchools = schools.values().toArray().filter(func(school) { school.isActive });
    let sortedSchools = activeSchools.sort();
    let limitNat32 = Nat32.fromNat(limit);
    let arraySize = Nat32.fromNat(sortedSchools.size());
    let endIndex = Nat32.min(limitNat32, arraySize);
    Array.tabulate<School>(endIndex.toNat(), func(i) { sortedSchools[i] });
  };

  // Admin: Get all active schools
  public query ({ caller }) func getActiveSchools() : async [School] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can view all schools");
    };
    schools.values().toArray().filter(func(school) { school.isActive });
  };

  // Admin: Get school details with recent submissions
  public query ({ caller }) func getSchoolDetails(schoolId : Nat) : async {
    school : School;
    recentSubmissions : [Submission];
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can view school details");
    };

    switch (schools.get(schoolId)) {
      case (null) {
        Runtime.trap("School not found");
      };
      case (?school) {
        let recentSubmissions = submissions.values().toArray().filter(
          func(submission) { submission.schoolId == schoolId }
        );
        {
          school;
          recentSubmissions;
        };
      };
    };
  };

  // Admin: Get schools by region
  public query ({ caller }) func getSchoolsByRegion(regionId : Nat) : async [School] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can filter schools by region");
    };

    let iter = schools.entries();
    let filteredIter = iter.filter(
      func((_, school)) { school.region.id == regionId and school.isActive }
    );
    let filteredList = List.fromIter<(Nat, School)>(filteredIter);
    let filteredArray = filteredList.toArray();
    filteredArray.map(func((_, school)) { school });
  };

  // Admin: Get dashboard statistics
  public query ({ caller }) func getDashboardStats() : async {
    totalActiveSchools : Nat;
    submissionsToday : Nat;
    averageScore : Nat;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Director/Management can view dashboard stats");
    };

    let activeSchools = schools.values().toArray().filter(func(school) { school.isActive });
    let totalActiveSchools = activeSchools.size();

    let now = Time.now();
    let oneDayNanos = 24 * 60 * 60 * 1_000_000_000;
    let todayStart = now - oneDayNanos;

    let todaySubmissions = submissions.values().toArray().filter(
      func(submission) { submission.date >= todayStart }
    );
    let submissionsToday = todaySubmissions.size();

    let allSubmissions = submissions.values().toArray();
    let totalScore = allSubmissions.foldLeft(
      0,
      func(acc, submission) { acc + submission.score }
    );
    let averageScore = if (allSubmissions.size() > 0) {
      totalScore / allSubmissions.size();
    } else {
      0;
    };

    {
      totalActiveSchools;
      submissionsToday;
      averageScore;
    };
  };
};
