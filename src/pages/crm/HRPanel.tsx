import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Briefcase, FileText, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { candidateApi, Candidate, jobPostApi, JobPost, jobApplicationApi, JobApplication, JobApplicationStatus } from '@/lib/api';
import { toast } from 'sonner';
import CandidateFormModal from '@/components/Modal/CandidateFormModal';
import CandidateViewModal from '@/components/Modal/CandidateViewModal';
import JobPostFormModal from '@/components/Modal/JobPostFormModal';
import JobPostViewModal from '@/components/Modal/JobPostViewModal';
import JobApplicationViewModal from '@/components/Modal/JobApplicationViewModal';
import DeleteModal from '@/components/Modal/DeleteModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const APPLICATION_STATUS_OPTIONS: JobApplicationStatus[] = [
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Rejected',
  'Hired'
];

export default function HRPanelPage() {
  // Candidate states
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Job Post states
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [jobPostsLoading, setJobPostsLoading] = useState(true);
  
  // Job Application states
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobPostFormModalOpen, setJobPostFormModalOpen] = useState(false);
  const [jobPostViewModalOpen, setJobPostViewModalOpen] = useState(false);
  const [jobPostDeleteModalOpen, setJobPostDeleteModalOpen] = useState(false);
  const [applicationViewModalOpen, setApplicationViewModalOpen] = useState(false);
  const [applicationDeleteModalOpen, setApplicationDeleteModalOpen] = useState(false);
  
  // Selected item states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedJobPost, setSelectedJobPost] = useState<JobPost | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'candidate' | 'jobPost' | 'application'>('candidate');

  // Fetch candidates on mount and when refreshKey changes
  useEffect(() => {
    fetchCandidates();
  }, [refreshKey]);

  // Fetch job posts on mount
  useEffect(() => {
    fetchJobPosts();
  }, []);

  // Fetch job applications on mount
  useEffect(() => {
    fetchJobApplications();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await candidateApi.getAll();
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setCandidates(response.data);
        } else if (response.data.candidates && Array.isArray(response.data.candidates)) {
          setCandidates(response.data.candidates);
        } else if (response.data.candidate) {
          setCandidates([response.data.candidate]);
        } else {
          setCandidates([]);
        }
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobPosts = async () => {
    setJobPostsLoading(true);
    try {
      const response = await jobPostApi.getAll();
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setJobPosts(response.data);
        } else if (response.data.jobPosts && Array.isArray(response.data.jobPosts)) {
          setJobPosts(response.data.jobPosts);
        } else if (response.data.jobPost) {
          setJobPosts([response.data.jobPost]);
        } else {
          setJobPosts([]);
        }
      } else {
        setJobPosts([]);
      }
    } catch (error) {
      console.error('Error fetching job posts:', error);
      toast.error('Failed to load job posts');
      setJobPosts([]);
    } finally {
      setJobPostsLoading(false);
    }
  };

  const fetchJobApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response = await jobApplicationApi.getAll();
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setJobApplications(response.data);
        } else if (response.data.jobApplications && Array.isArray(response.data.jobApplications)) {
          setJobApplications(response.data.jobApplications);
        } else if (response.data.jobApplication) {
          setJobApplications([response.data.jobApplication]);
        } else {
          setJobApplications([]);
        }
      } else {
        setJobApplications([]);
      }
    } catch (error) {
      console.error('Error fetching job applications:', error);
      toast.error('Failed to load job applications');
      setJobApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Candidate handlers
  const handleAddCandidate = () => {
    setSelectedCandidate(null);
    setFormModalOpen(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormModalOpen(true);
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setViewModalOpen(true);
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDeleteType('candidate');
    setDeleteModalOpen(true);
  };

  // Job Post handlers
  const handleAddJobPost = () => {
    setSelectedJobPost(null);
    setJobPostFormModalOpen(true);
  };

  const handleEditJobPost = (jobPost: JobPost) => {
    setSelectedJobPost(jobPost);
    setJobPostFormModalOpen(true);
  };

  const handleViewJobPost = (jobPost: JobPost) => {
    setSelectedJobPost(jobPost);
    setJobPostViewModalOpen(true);
  };

  const handleDeleteJobPost = (jobPost: JobPost) => {
    setSelectedJobPost(jobPost);
    setDeleteType('jobPost');
    setJobPostDeleteModalOpen(true);
  };

  // Job Application handlers
  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setApplicationViewModalOpen(true);
  };

  const handleDeleteApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setDeleteType('application');
    setApplicationDeleteModalOpen(true);
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      const response = await jobApplicationApi.updateStatus(applicationId, newStatus);
      if (response.success) {
        toast.success('Status updated successfully');
        fetchJobApplications();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (deleteType === 'candidate') {
      if (!selectedCandidate) return;
      
      setIsDeleting(true);
      try {
        await candidateApi.delete(selectedCandidate.id);
        toast.success('Candidate deleted successfully');
        setDeleteModalOpen(false);
        setRefreshKey(old => old + 1);
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete candidate');
      } finally {
        setIsDeleting(false);
      }
    } else if (deleteType === 'jobPost') {
      if (!selectedJobPost) return;
      
      setIsDeleting(true);
      try {
        await jobPostApi.delete(selectedJobPost.id);
        toast.success('Job post deleted successfully');
        setJobPostDeleteModalOpen(false);
        fetchJobPosts();
      } catch (error) {
        console.error('Error deleting job post:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete job post');
      } finally {
        setIsDeleting(false);
      }
    } else if (deleteType === 'application') {
      if (!selectedApplication) return;
      
      setIsDeleting(true);
      try {
        await jobApplicationApi.delete(selectedApplication.id);
        toast.success('Application deleted successfully');
        setApplicationDeleteModalOpen(false);
        fetchJobApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete application');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setRefreshKey(old => old + 1);
  };

  const handleJobPostFormSuccess = () => {
    fetchJobPosts();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer Sent':
      case 'Accepted Offer':
        return 'text-success';
      case 'Interview Scheduled':
        return 'text-primary';
      case 'Shortlisted':
        return 'text-warning';
      case 'Pending':
      case 'Applied':
      default:
        return 'text-muted-foreground';
    }
  };

  const getJobPostStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-success';
      case 'Closed':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'text-warning';
      case 'Interview Scheduled':
        return 'text-primary';
      case 'Hired':
        return 'text-success';
      case 'Rejected':
        return 'text-destructive';
      case 'Applied':
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">HR Panel</h1>
          <p className="text-sm text-muted-foreground">Candidate & job management</p>
        </div>
      </div>

      {/* Tabs for Candidates, Job Posts, and Applied Jobs */}
      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="jobs">Job Posts</TabsTrigger>
          <TabsTrigger value="applications">Applied Jobs</TabsTrigger>
        </TabsList>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              className="gradient-hero text-primary-foreground border-0" 
              onClick={handleAddCandidate}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add Candidate
            </Button>
          </div>

          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No candidates found</p>
                    <Button 
                      variant="link" 
                      onClick={handleAddCandidate}
                      className="mt-2"
                    >
                      Add your first candidate
                    </Button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Candidate</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Position</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map(c => (
                        <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium text-foreground">{c.name}</td>
                          <td className="p-4 text-muted-foreground">{c.position}</td>
                          <td className="p-4">
                            <span className={`text-xs font-medium ${getStatusColor(c.status)}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{formatDate(c.createdAt)}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewCandidate(c)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCandidate(c)}
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCandidate(c)}
                                title="Delete"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Posts Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              className="gradient-hero text-primary-foreground border-0" 
              onClick={handleAddJobPost}
            >
              <Briefcase className="w-4 h-4 mr-2" /> Post Job
            </Button>
          </div>

          {/* Job Posts Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            {jobPostsLoading ? (
              <div className="col-span-full flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : jobPosts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No job posts found</p>
                <Button 
                  variant="link" 
                  onClick={handleAddJobPost}
                  className="mt-2"
                >
                  Post your first job
                </Button>
              </div>
            ) : (
              jobPosts.map((j) => (
                <Card key={j.id} className="shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-foreground truncate">{j.title}</h3>
                        <p className="text-sm text-muted-foreground">{j.position} openings • {j.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">{j.location}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-medium ${getJobPostStatusColor(j.status)}`}>
                            {j.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleViewJobPost(j)}
                              title="View"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditJobPost(j)}
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteJobPost(j)}
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Applied Jobs Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {applicationsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : jobApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No job applications found</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Candidate</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Job Title</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Mobile</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Applied Date</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobApplications.map(app => (
                        <tr key={app.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium text-foreground">{app.name}</td>
                          <td className="p-4 text-muted-foreground">{app.jobTitle}</td>
                          <td className="p-4 text-muted-foreground">{app.email}</td>
                          <td className="p-4 text-muted-foreground">{app.mobile}</td>
                          <td className="p-4">
                            <Select 
                              value={app.status} 
                              onValueChange={(value) => handleStatusChange(app.id, value)}
                            >
                              <SelectTrigger className={`w-[130px] h-8 text-xs ${getApplicationStatusColor(app.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {APPLICATION_STATUS_OPTIONS.map(status => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4 text-muted-foreground">{formatDate(app.createdAt)}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewApplication(app)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteApplication(app)}
                                title="Delete"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Candidate Modal */}
      <CandidateFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        candidate={selectedCandidate}
        onSuccess={handleFormSuccess}
      />

      {/* View Candidate Modal */}
      <CandidateViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        candidate={selectedCandidate}
      />

      {/* Delete Candidate Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Candidate"
        description="Are you sure you want to delete this candidate? This action cannot be undone."
        itemName={selectedCandidate?.name}
        isDeleting={isDeleting}
      />

      {/* Add/Edit Job Post Modal */}
      <JobPostFormModal
        open={jobPostFormModalOpen}
        onOpenChange={setJobPostFormModalOpen}
        jobPost={selectedJobPost}
        onSuccess={handleJobPostFormSuccess}
      />

      {/* View Job Post Modal */}
      <JobPostViewModal
        open={jobPostViewModalOpen}
        onOpenChange={setJobPostViewModalOpen}
        jobPost={selectedJobPost}
      />

      {/* Delete Job Post Modal */}
      <DeleteModal
        open={jobPostDeleteModalOpen}
        onOpenChange={setJobPostDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Job Post"
        description="Are you sure you want to delete this job post? This action cannot be undone."
        itemName={selectedJobPost?.title}
        isDeleting={isDeleting}
      />

      {/* View Application Modal */}
      <JobApplicationViewModal
        open={applicationViewModalOpen}
        onOpenChange={setApplicationViewModalOpen}
        application={selectedApplication}
      />

      {/* Delete Application Modal */}
      <DeleteModal
        open={applicationDeleteModalOpen}
        onOpenChange={setApplicationDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Application"
        description="Are you sure you want to delete this application? This action cannot be undone."
        itemName={selectedApplication?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
