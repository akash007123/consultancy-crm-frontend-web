import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Briefcase, FileUp, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { JobPost, jobApplicationApi } from '@/lib/api';
import { toast } from 'sonner';

const applicationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    address: z.string().min(5, 'Please provide a complete address'),
    education: z.string().min(2, 'Please provide your highest education'),
    resume: z.any().refine((files) => files?.length === 1, 'Resume is required')
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplyJob() {
    const location = useLocation();
    const navigate = useNavigate();
    const job = location.state?.job as JobPost | undefined;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // If no job data in state, redirect back to jobs page
    useEffect(() => {
        if (!job) {
            navigate('/jobs', { replace: true });
        }
    }, [job, navigate]);

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            name: '',
            email: '',
            mobile: '',
            address: '',
            education: '',
        },
    });

    const onSubmit = async (data: ApplicationFormValues) => {
        if (!job) return;
        
        setIsSubmitting(true);
        try {
            // Submit application to backend
            const response = await jobApplicationApi.submit({
                jobId: job.id,
                jobTitle: job.title,
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                education: data.education,
                address: data.address
            });

            if (response.success) {
                toast.success('Application submitted successfully!');
                setIsSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(response.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!job) return null;

    if (isSuccess) {
        return (
            <div className="pt-24 pb-16 min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="container max-w-lg px-4"
                >
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm text-center py-10 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                        <CardHeader>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </motion.div>
                            <CardTitle className="text-3xl font-heading mb-2">Application Submitted!</CardTitle>
                            <CardDescription className="text-lg">
                                Thank you for applying for the <strong className="text-foreground">{job.title}</strong> position.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-8">
                                We've received your application and resume. Our hiring team will review your profile and get back to you shortly if your qualifications match our requirements.
                            </p>
                            <Button
                                onClick={() => navigate('/jobs')}
                                className="w-full sm:w-auto gradient-hero text-primary-foreground border-0"
                            >
                                Return to Job Listings
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="pt-24 pb-16 min-h-screen bg-background relative">
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <div className="container px-4 md:px-6 relative z-10">

                <div className="mb-8 max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        className="mb-6 pl-0 hover:bg-transparent hover:text-primary transition-colors"
                        onClick={() => navigate('/jobs')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col md:flex-row gap-8">

                            {/* Left Column: Job Details Summary */}
                            <div className="flex-1 md:max-w-[350px]">
                                <div className="sticky top-24">
                                    <h2 className="text-xl font-semibold mb-4 text-foreground/80 uppercase tracking-wider text-sm">Applying For</h2>
                                    <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
                                        <div className="h-2 w-full gradient-hero" />
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                                    {job.type}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-2xl leading-tight">{job.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4 mr-3 text-primary/70" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Briefcase className="w-4 h-4 mr-3 text-primary/70" />
                                                {job.experience}
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4 mr-3 text-primary/70" />
                                                Posted: {formatDate(job.date)}
                                            </div>
                                            <div className="pt-4 mt-2 border-t border-border/50">
                                                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                                                    {job.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Right Column: Application Form */}
                            <div className="flex-[2]">
                                <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-heading">Candidate Information</CardTitle>
                                        <CardDescription>
                                            Please fill out the form below to submit your application.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="John Doe" className="bg-background/50" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="mobile"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Mobile Number <span className="text-destructive">*</span></FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="+91 9876543210" className="bg-background/50" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input type="email" placeholder="john.doe@example.com" className="bg-background/50" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="education"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Highest Education <span className="text-destructive">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. B.Tech in Computer Science" className="bg-background/50" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Current Address <span className="text-destructive">*</span></FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Enter your full address"
                                                                    className="resize-none bg-background/50"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="resume"
                                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                                        <FormItem>
                                                            <FormLabel>Resume/CV (PDF or Word) <span className="text-destructive">*</span></FormLabel>
                                                            <FormControl>
                                                                <div className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors rounded-xl p-6 text-center bg-background/30 flex flex-col items-center justify-center group relative overflow-hidden">
                                                                    <Input
                                                                        type="file"
                                                                        accept=".pdf,.doc,.docx"
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                        onChange={(e) => onChange(e.target.files)}
                                                                        {...fieldProps}
                                                                    />
                                                                    <div className="flex flex-col items-center pointer-events-none group-hover:scale-105 transition-transform">
                                                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                                                            <FileUp className="w-6 h-6 text-primary" />
                                                                        </div>
                                                                        <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {value && value.length > 0 ? (
                                                                                <span className="text-primary font-medium">{value[0].name}</span>
                                                                            ) : (
                                                                                "PDF, DOC, or DOCX up to 5MB"
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="pt-6 border-t border-border/50">
                                                    <Button
                                                        type="submit"
                                                        className="w-full gradient-hero text-primary-foreground border-0 h-12 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                                Submitting Application...
                                                            </>
                                                        ) : (
                                                            'Submit Application'
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            </div>

                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
