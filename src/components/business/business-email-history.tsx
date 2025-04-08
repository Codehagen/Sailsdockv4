"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Send,
  Plus,
  Calendar,
  User,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip,
  Star,
  ExternalLink,
  ArrowLeft,
  Trash,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fetchBusinessEmails } from "@/app/actions/email";
import { nb } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailAttachment {
  name: string;
  size: number;
  type: string;
}

interface Email {
  id: string;
  subject: string;
  body: string;
  htmlBody?: string;
  fromEmail: string;
  fromName?: string;
  toEmail: string[];
  sentAt: Date;
  isRead: boolean;
  isStarred?: boolean;
  attachments?: EmailAttachment[];
  business?: { id: string; name: string } | null;
  contact?: { id: string; name: string; email: string } | null;
}

interface BusinessEmailHistoryProps {
  businessId: string;
}

export function BusinessEmailHistory({
  businessId,
}: BusinessEmailHistoryProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [contactCount, setContactCount] = useState<number>(0);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Fetch emails when component mounts or businessId changes
  useEffect(() => {
    fetchEmails();
  }, [businessId]);

  // Fetch business emails
  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchBusinessEmails(businessId, {
        limit: 100,
        orderBy: "sentAt",
        orderDirection: "desc",
      });

      if (result.success) {
        setEmails(result.emails || []);
        setBusinessName(result.businessName || "");
        setContactCount(result.contactCount || 0);
      } else {
        setError(result.error || "Failed to load emails");
      }
    } catch (error) {
      setError("An error occurred while fetching emails");
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for when you implement email functionality
  const openEmailModal = () => {
    toast.info("Email functionality", {
      description: "Email sending functionality will be implemented soon.",
    });
  };

  // Helper to extract domain
  const extractDomain = (name: string): string => {
    // Simple conversion for demo purposes
    return name.replace(/\s+/g, "").toLowerCase() + ".com";
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d. MMMM yyyy, HH:mm", { locale: nb });
  };

  // Handle opening an email
  const handleOpenEmail = (email: Email) => {
    setSelectedEmail(email);
    setShowEmailDialog(true);
  };

  // Get icon for attachment based on file type
  const getAttachmentIcon = (type: string) => {
    return <Paperclip className="h-4 w-4" />;
  };

  // Format file size in human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // Get email attachments
  const getEmailAttachments = (email: Email): EmailAttachment[] => {
    return email.attachments || [];
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 text-center border border-destructive/20 bg-destructive/10 rounded-md">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchEmails}
          >
            Try Again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
        </div>
      ) : emails.length > 0 ? (
        <div className="space-y-4">
          {emails.map((email) => (
            <Card
              key={email.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
              onClick={() => handleOpenEmail(email)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Mail
                        className={`h-4 w-4 ${
                          email.isRead
                            ? "text-muted-foreground"
                            : "text-primary"
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          {email.fromName || email.fromEmail.split("@")[0]}
                          {!email.isRead && (
                            <Badge
                              variant="secondary"
                              className="ml-2 px-1.5 py-0 text-xs"
                            >
                              New
                            </Badge>
                          )}
                          {email.isStarred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> {email.fromEmail}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(email.sentAt)}
                    </div>
                  </div>

                  <div className="text-sm font-medium">{email.subject}</div>

                  <p className="text-sm line-clamp-2">
                    {email.body?.substring(0, 120)}
                    {email.body?.length > 120 ? "..." : ""}
                  </p>

                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        To: {email.toEmail.join(", ")}
                      </span>
                    </div>

                    {email.contact && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {email.contact.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No email history</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Send an email to this business to start a conversation or sync
            emails if you have existing communication.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={openEmailModal}>
              <Send className="h-4 w-4 mr-2" />
              Send first email
            </Button>
          </div>
        </div>
      )}

      {/* Email Detail Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0">
          {selectedEmail && (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmailDialog(false)}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <DialogTitle className="text-xl font-semibold">
                    {selectedEmail.subject || "(No subject)"}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Forward className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 border-b bg-muted/30">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">From:</div>
                    <div>
                      {selectedEmail.fromName || selectedEmail.fromEmail} &lt;
                      {selectedEmail.fromEmail}&gt;
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">To:</div>
                    <div>{selectedEmail.toEmail.join(", ")}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Date:</div>
                    <div>{formatDate(selectedEmail.sentAt)}</div>
                  </div>
                  {getEmailAttachments(selectedEmail).length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="font-medium">Attachments:</div>
                      <div className="flex flex-wrap gap-2">
                        {getEmailAttachments(selectedEmail).map(
                          (attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-background py-1 px-2 rounded-md text-xs"
                            >
                              {getAttachmentIcon(attachment.type)}
                              <span>{attachment.name}</span>
                              <span className="text-muted-foreground">
                                ({formatFileSize(attachment.size)})
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Tabs
                defaultValue="text"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="border-b px-4">
                  <TabsList className="w-fit h-9 mt-2">
                    <TabsTrigger value="text" className="h-8 px-3">
                      Text
                    </TabsTrigger>
                    {selectedEmail.htmlBody && (
                      <TabsTrigger value="html" className="h-8 px-3">
                        HTML
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <TabsContent
                  value="text"
                  className="flex-1 overflow-auto p-4 m-0 border-0"
                >
                  <div className="whitespace-pre-wrap">
                    {selectedEmail.body}
                  </div>
                </TabsContent>

                {selectedEmail.htmlBody && (
                  <TabsContent
                    value="html"
                    className="flex-1 overflow-auto p-4 m-0 border-0"
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedEmail.htmlBody,
                      }}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
