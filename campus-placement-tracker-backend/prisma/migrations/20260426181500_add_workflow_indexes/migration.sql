-- Add indexes used by the Milestone 4 dashboards and workflow screens.
CREATE INDEX "Job_recruiterId_idx" ON "Job"("recruiterId");
CREATE INDEX "Job_isPublished_applicationDeadline_idx" ON "Job"("isPublished", "applicationDeadline");
CREATE INDEX "Application_studentId_idx" ON "Application"("studentId");
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");
CREATE INDEX "Application_status_idx" ON "Application"("status");
CREATE INDEX "InterviewSlot_status_startTime_idx" ON "InterviewSlot"("status", "startTime");
