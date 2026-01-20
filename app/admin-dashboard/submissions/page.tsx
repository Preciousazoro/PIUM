"use client";

import { useEffect, useState, useCallback } from "react";
import feather from "feather-icons";
import { toast } from "sonner";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { Pagination } from "@/components/ui/Pagination";

// Admin Submissions Page
export default function AdminSubmissionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "Reviewed" | "Approved" | "Rejected" | "Rewarded"
  >("All");

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // selected submission state for preview modal
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  // checkImageExists is already defined later in the file

  useEffect(() => {
    feather.replace();
  }, []);

  useEffect(() => {
    feather.replace({ width: 16, height: 16 });
  }, [subs, statusFilter]);

  const loadSubmissions = useCallback(
    async (page = 1, limit = 10, status = statusFilter) => {
      setLoading(true);
      try {
        const url = new URL("/api/submissions", window.location.origin);
        url.searchParams.set("page", page.toString());
        url.searchParams.set("limit", limit.toString());
        if (status !== "All") {
          url.searchParams.set("status", status);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to load submissions");

        const data = await res.json();
        setSubs(data.data || []);

        // Update pagination state
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: data.pagination.page,
            limit: data.pagination.limit,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
            hasNextPage: data.pagination.page < data.pagination.totalPages,
            hasPreviousPage: data.pagination.page > 1,
          }));
        } else {
          // fallback if API doesn't send pagination object
          setPagination(prev => ({
            ...prev,
            page,
            limit,
            total: data.data?.length || 0,
            totalPages: Math.ceil((data.data?.length || 0) / limit)
          }));
        }
      } catch (err) {
        console.error(err);
        toast.error((err as any)?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  // Load submissions on component mount and when pagination or filter changes
  useEffect(() => {
    loadSubmissions(pagination.page, pagination.limit, statusFilter);
  }, [pagination.page, pagination.limit, statusFilter, loadSubmissions]);

  // No need for client-side filtering as it's handled by the API
  const filtered = subs;

  // Handle status filter change
  const handleStatusFilter = (status: typeof statusFilter) => {
    setStatusFilter(status);
    // Reset to first page when changing filters
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Generic update status (used when approving/rejecting from modal or inline)
  const updateStatus = async (submissionId: string, nextStatus: string) => {
    try {
      const result = await toast.promise(
        (async () => {
          const res = await fetch(`/api/submissions/${String(submissionId)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({} as any));
            throw new Error((data as any)?.error || "Failed to update submission");
          }
          return res.json();
        })(),
        {
          loading: `Updating to ${nextStatus}...`,
          success: `Submission ${nextStatus}`,
          error: (err) => (err as any)?.message || "Failed to update submission",
        }
      );

      // Refresh current page after successful update
      await loadSubmissions(pagination.page, pagination.limit, statusFilter);
      return result;
    } catch (error) {
      // The toast will handle showing the error message
      console.error('Error updating submission:', error);
      throw error; // Re-throw to allow parent functions to handle the error if needed
    }
  };

  // Utility to detect image file types
  const isImageFile = (url: string): boolean => {
    if (!url) return false;
    
    // Common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    
    // Check for common image patterns in the URL
    if (lowerUrl.includes('screenshot') || 
        lowerUrl.includes('image') ||
        lowerUrl.includes('photo') ||
        lowerUrl.includes('img') ||
        lowerUrl.includes('cloudinary') ||
        lowerUrl.match(/screenshot\d*/i) ||
        lowerUrl.match(/img_\d+/i) ||
        lowerUrl.match(/image_\d+/i)) {
      return true;
    }

    // Check file extension
    return imageExtensions.some(ext => lowerUrl.endsWith(ext));
  };

  // Function to get optimized image URL
  const getOptimizedUrl = (url: string): string => {
    if (!url) return '';
    
    // If it's already a full URL, use it as is
    if (url.startsWith('http')) {
      // If it's a Cloudinary URL, ensure it has optimization parameters
      if (url.includes('res.cloudinary.com')) {
        // Don't modify if it already has transformation parameters
        if (!url.includes('/upload/') || url.includes('/f_') || url.includes('/q_')) {
          return url;
        }
        return url.replace('/upload/', '/upload/f_auto,q_auto/');
      }
      return url;
    }
    
    // Handle Cloudinary public IDs
    if (url.startsWith('image/') || url.includes('cloudinary')) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dummy';
      const cleanPath = url.replace(/^\/+|^image\//, '');
      return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${cleanPath}`;
    }
    
    // For local files in development
    if (process.env.NODE_ENV === 'development') {
      // If it's already a path starting with /uploads, use it as is
      if (url.startsWith('/uploads/')) {
        return url;
      }
      // Otherwise, prepend /uploads/ if it's just a filename
      return `/uploads/${url.replace(/^\/+/, '')}`;
    }
    
    // For production, you might want to use a CDN or storage bucket
    // Replace this with your actual CDN URL
    const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || 'https://your-cdn-domain.com';
    return `${cdnBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  // Function to check if an image exists
  const checkImageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };
  
  // Function to load an image with retry logic
  const loadImage = async (url: string): Promise<string> => {
    const optimizedUrl = getOptimizedUrl(url);
    
    // Try the optimized URL first
    if (await checkImageExists(optimizedUrl)) {
      return optimizedUrl;
    }
    
    // If optimized URL fails, try the original URL
    if (url !== optimizedUrl && await checkImageExists(url)) {
      return url;
    }
    
    // If both fail, return the optimized URL anyway (will show error state)
    return optimizedUrl;
  };

  // Try to find an existing image file with common extensions or similar names
  const findExistingImage = async (basePath: string): Promise<string> => {
    if (!basePath) return '';
    
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    // If it already has an extension, return it as is
    const hasExtension = extensions.some(ext => basePath.toLowerCase().endsWith(ext));
    if (hasExtension) {
      return basePath;
    }
    
    // Try with common extensions
    for (const ext of extensions) {
      const testPath = `${basePath}${ext}`;
      if (await checkImageExists(testPath)) {
        return testPath;
      }
    }
    
    // If no extension found, return the original path
    return basePath;
  };

  const openPreview = async (submissionId: string) => {
    if (!submissionId) {
      console.error('No submission ID provided');
      toast.error('Invalid submission ID');
      return;
    }
    
    setPreviewLoading(true);
    setSelectedSubmission(null);
    setPreviewImageIndex(0);

    try {
      console.log(`Fetching submission with ID: ${submissionId}`);
      const res = await fetch(`/api/submissions/${submissionId}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error Response:', {
          status: res.status,
          statusText: res.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to load submission: ${res.status} ${res.statusText}`);
      }
      
      let data = await res.json();
      console.log('Submission data received:', data);
      
      // Handle case where screenshot is in notes field (format: "screenshot=filename.png")
      if ((!data.proofUrls || data.proofUrls.length === 0) && data.notes) {
        const screenshotMatch = data.notes.match(/screenshot=([^\s]+)/i);
        if (screenshotMatch && screenshotMatch[1]) {
          const filename = screenshotMatch[1].trim();
          // Assuming files are stored in /public/uploads/ directory
          const fileUrl = `/uploads/${filename}`;
          data = {
            ...data,
            proofUrls: [fileUrl],
            // Keep the original notes but remove the screenshot part
            notes: data.notes.replace(/screenshot=[^\s]+\s*/i, '').trim() || undefined
          };
          console.log('Extracted screenshot from notes:', fileUrl);
        }
      }
      
      // Normalize proof URLs - handle both proofUrls (array) and proofUrl (string)
      let proofUrls: string[] = [];
      if (data.proofUrls && Array.isArray(data.proofUrls)) {
        proofUrls = data.proofUrls
          .filter((url: any) => url && typeof url === 'string')
          .map((url: string) => {
            // Convert relative paths to absolute if needed
            if (url.startsWith('/')) {
              return url;
            }
            // Handle case where it's just a filename
            if (!url.startsWith('http') && !url.startsWith('blob:')) {
              return `/uploads/${url}`;
            }
            return url;
          });
      } else if (data.proofUrl) {
        proofUrls = [data.proofUrl];
      }
      
      console.log('Processed proof URLs:', proofUrls);
      
      const submissionData = {
        ...data,
        proofUrls,
        // Ensure other required fields have default values if not present
        status: data.status || 'pending',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        // Ensure user and task snapshots exist
        userSnapshot: data.userSnapshot || {
          name: data.userId || 'Unknown User',
          email: ''
        },
        taskSnapshot: data.taskSnapshot || {
          title: data.taskId || 'Unknown Task',
          rewardPoints: 0
        }
      };
      
      setSelectedSubmission(submissionData);
    } catch (err) {
      console.error('Error in openPreview:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Failed to load submission: ${errorMessage}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handler when admin approves from modal
  const handleApproveFromPreview = async (submissionId: string) => {
    try {
      await updateStatus(submissionId, "Approved");
      toast.success("Submission approved");
      setSelectedSubmission(null);
    } catch (e) {
      // updateStatus already shows toast on error
    }
  };

  // Handler when admin rejects from modal
  const handleRejectFromPreview = async (submissionId: string) => {
    try {
      await updateStatus(submissionId, "Rejected");
      toast.success("Submission rejected");
      setSelectedSubmission(null);
    } catch (e) {
      // updateStatus already shows toast on error
    }
  };

  // Load image URLs when selectedSubmission changes
  useEffect(() => {
    let isMounted = true;
    
    const loadImageUrls = async () => {
      if (!selectedSubmission?.proofUrls?.length) return;
      
      setPreviewLoading(true);
      const urls: Record<string, string> = {};
      
      try {
        // Load all images in parallel
        await Promise.all(
          selectedSubmission.proofUrls.map(async (url: string) => {
            if (!isMounted) return;
            
            try {
              // First try to find the best matching image URL
              const foundUrl = await findExistingImage(url);
              // Then try to load it with optimizations
              urls[url] = await loadImage(foundUrl);
            } catch (error) {
              console.error('Error loading image:', error);
              urls[url] = url; // Fallback to original URL
            }
          })
        );
        
        if (isMounted) {
          setImageUrls(urls);
        }
      } catch (error) {
        console.error('Error in image loading batch:', error);
      } finally {
        if (isMounted) {
          setPreviewLoading(false);
        }
      }
    };
    
    loadImageUrls();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [selectedSubmission]);

  return (
    <div className="min-h-screen flex bg-background text-foreground font-inter transition-colors">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Submissions</h2>
            <div className="text-sm text-muted-foreground">Total: {pagination.total}</div>
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(["All", "Pending", "Reviewed", "Approved", "Rejected", "Rewarded"] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusFilter(st)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  statusFilter === st
                    ? "bg-gradient-to-r from-green-500 to-purple-500 text-white border-transparent"
                    : "bg-muted text-foreground border-border hover:bg-muted/80"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-2xl overflow-hidden border border-border transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    {["User", "Task", "Reward", "Status", "Submitted", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td className="px-6 py-6 text-muted-foreground" colSpan={6}>
                        Loading submissions...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-muted-foreground" colSpan={6}>
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s._id || s.id} className="hover:bg-muted/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">
                            {s.userSnapshot?.name || s.userSnapshot?.email || s.userId}
                          </div>
                          <div className="text-xs text-muted-foreground">{s.userSnapshot?.email || ""}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{s.taskSnapshot?.title || s.taskId}</div>
                          <div className="text-xs text-muted-foreground">Task ID: {s.taskSnapshot?.id || s.taskId}</div>
                        </td>
                        <td className="px-6 py-4">{typeof s.taskSnapshot?.rewardPoints === "number" ? `${s.taskSnapshot.rewardPoints} TP` : "-"}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400">
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* Show Review button -> opens modal preview (for Pending items) */}
                            {s.status === "Pending" && (
                              <button
                                onClick={() => openPreview(String(s._id ?? s.id))}
                                className="text-blue-500 hover:text-blue-400 text-sm border border-blue-500/30 px-2 py-1 rounded"
                              >
                                Review
                              </button>
                            )}

                            {/* For Reviewed items show Approve/Reject inline as well */}
                            {s.status === "Reviewed" && (
                              <>
                                <button
                                  onClick={() => updateStatus(String(s._id ?? s.id), "Approved")}
                                  className="text-green-500 hover:text-green-400 text-sm border border-green-500/30 px-2 py-1 rounded"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(String(s._id ?? s.id), "Rejected")}
                                  className="text-red-500 hover:text-red-400 text-sm border border-red-500/30 px-2 py-1 rounded"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {/* For Approved -> Reward */}
                            {s.status === "Approved" && (
                              <button
                                onClick={() => updateStatus(String(s._id ?? s.id), "Rewarded")}
                                className="text-purple-500 hover:text-purple-400 text-sm border border-purple-500/30 px-2 py-1 rounded"
                              >
                                Reward
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-border">
                <Pagination
                  currentPage={pagination.page}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                  onItemsPerPageChange={(perPage) => setPagination((prev) => ({ ...prev, limit: perPage, page: 1 }))}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===== Submission Preview Modal ===== */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSelectedSubmission(null)}
          />
          <div className="relative z-10 w-full max-w-4xl bg-card border border-border rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">Submission Preview</h3>
                <p className="text-sm text-muted-foreground">ID: {selectedSubmission._id || selectedSubmission.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-3 py-1 rounded text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: proof preview area */}
              <div className="space-y-4">
                {previewLoading ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Loading preview...
                  </div>
                ) : selectedSubmission.proofUrls && selectedSubmission.proofUrls.length > 0 ? (
                  <>
                    <div className="relative bg-black rounded border border-border h-[60vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
                      {(() => {
                        const proofUrl = selectedSubmission.proofUrls[previewImageIndex];
                        const isImage = isImageFile(proofUrl);
                        
                        // Function to handle Cloudinary URLs
                        const getOptimizedUrl = (url: string) => {
                          if (!url) return '';
                          
                          // If it's already a complete URL, use it as is
                          if (url.startsWith('http')) return url;
                          
                          // Handle Cloudinary public IDs
                          const isCloudinaryUrl = url.includes('cloudinary.com') || url.startsWith('image/');
                          if (isCloudinaryUrl) {
                            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dummy';
                            // Remove any leading slashes or 'image/' prefix
                            const cleanPath = url.replace(/^\/+|^image\//, '');
                            return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${cleanPath}`;
                          }
                          
                          return url;
                        };
                        
                        const optimizedUrl = getOptimizedUrl(proofUrl);
                        const finalImageUrl = imageUrls[optimizedUrl] || optimizedUrl;
                        
                        // Check if we should try to display as an image
                        const shouldDisplayAsImage = isImage || 
                          (typeof proofUrl === 'string' && (
                            proofUrl.includes('cloudinary.com') ||
                            proofUrl.startsWith('image/') ||
                            proofUrl.toLowerCase().includes('screenshot') || 
                            proofUrl.toLowerCase().includes('image') ||
                            proofUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                          ));

                        if (shouldDisplayAsImage) {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
                              {/* Loading indicator - only show if we don't have the image yet */}
                              {!finalImageUrl && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                              )}
                              
                              {/* Image element with error handling */}
                              <div className="relative w-full h-full flex items-center justify-center">
                                {finalImageUrl ? (
                                  <>
                                    <img
                                      src={finalImageUrl}
                                      alt="Submission proof"
                                      className={`max-h-full max-w-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity ${
                                        !finalImageUrl ? 'opacity-0' : ''
                                      }`}
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.style.display = 'none';
                                        const fallback = document.getElementById(`image-fallback-${previewImageIndex}`);
                                        if (fallback) {
                                          fallback.classList.remove('hidden');
                                        }
                                      }}
                                    />
                                    
                                    {/* Fallback UI for when image fails to load */}
                                    <div 
                                      id={`image-fallback-${previewImageIndex}`}
                                      className="hidden flex-col items-center justify-center p-4 text-center text-gray-500"
                                    >
                                      <svg
                                        className="w-16 h-16 mb-2 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <p>Unable to load image</p>
                                      <p className="text-sm mt-2">
                                        {finalImageUrl ? 'The image may have been moved or deleted.' : 'Loading image...'}
                                      </p>
                                      <button
                                        onClick={() => window.open(finalImageUrl, '_blank')}
                                        className="mt-2 text-blue-500 hover:underline text-sm"
                                      >
                                        Open in new tab
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-muted-foreground">Loading image...</div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // If not an image, show file download button
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <a
                              href={finalImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Open File
                            </a>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Thumbnails if multiple */}
                    {selectedSubmission.proofUrls.length > 1 && (
                      <div className="flex gap-2 overflow-auto pt-2">
                        {selectedSubmission.proofUrls.map((url: string, i: number) => (
                          <button
                            key={url + i}
                            onClick={() => setPreviewImageIndex(i)}
                            className={`w-20 h-14 rounded overflow-hidden border ${i === previewImageIndex ? "border-[#ff004f]" : "border-border"}`}
                          >
                            {isImageFile(url) ? (
                              <img src={url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">FILE</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 bg-muted rounded text-sm text-muted-foreground">No proof uploaded for this submission.</div>
                )}
              </div>

              {/* Right: metadata & actions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">User</span><span className="font-medium">{selectedSubmission.user?.name || selectedSubmission.userSnapshot?.name || selectedSubmission.userSnapshot?.email || selectedSubmission.userId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Task</span><span className="font-medium">{selectedSubmission.task?.title || selectedSubmission.taskSnapshot?.title || selectedSubmission.taskId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reward</span><span className="font-medium">{selectedSubmission.reward ?? selectedSubmission.taskSnapshot?.rewardPoints ?? "-"} TP</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium">{selectedSubmission.status}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span className="font-medium">{selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : (selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : "-")}</span></div>
                </div>

                {/* any notes */}
                {selectedSubmission.notes && (
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Notes</div>
                    <div className="p-3 bg-muted rounded">{selectedSubmission.notes}</div>
                  </div>
                )}

                {/* Task link if present */}
                {selectedSubmission.taskLink && (
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Task Link</div>
                    <a href={selectedSubmission.taskLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#ff004f] underline">
                      Open task link
                    </a>
                  </div>
                )}

                {/* Approve / Reject Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApproveFromPreview(String(selectedSubmission._id ?? selectedSubmission.id))}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectFromPreview(String(selectedSubmission._id ?? selectedSubmission.id))}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}