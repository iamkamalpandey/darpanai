import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Phone } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Appointment } from "@shared/schema";

export default function ConsultationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    retry: false,
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        status: "cancelled"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment cancelled",
        description: "Your consultation has been cancelled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "confirmed":
        return <Badge variant="secondary">Confirmed</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get contact method icon
  const getContactIcon = (method: string) => {
    switch (method) {
      case "phone":
        return <Phone className="h-4 w-4 mr-1" />;
      case "whatsapp":
        return (
          <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        );
      case "viber":
        return (
          <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.693 6.698.623 9.82c-.06 3.11-.122 8.946 5.5 10.565v2.42s-.037.98.609.98c.779 0 1.485-.952 2.366-2.081 2.6.218 4.599-.407 4.827-.511.524-.243 3.49-.553 3.982-4.496.514-4.108-.247-6.704-1.594-7.883h-.002c-.407-.4-1.874-1.466-5.23-1.669-.5-.045-1.05-.063-1.683-.063v-.063zm.146 1.605c.511 0 1.023.018 1.486.057 2.858.173 4.037 1.061 4.352 1.364 1.087.956 1.636 3.211 1.218 6.581-.416 3.324-2.72 3.512-3.096 3.698-.176.08-1.84.597-3.997.455 0 0-1.589 1.96-2.096 2.466-.089.086-.199.053-.195-.1.007-.242.03-3.767.03-3.767-4.76-1.348-4.46-6.472-4.412-9.168.055-2.696.557-4.81 1.97-6.211 1.96-1.834 5.603-2.097 7.428-2.077l2.368.028-.055-.327z" />
            <path d="M11.487 5.512c-.277 0-.564.008-.856.019-1.09.04-2.252.244-3.21.958-.7.523-1.204 1.312-1.307 2.324-.067.661-.067 1.353.016 2.073.134 1.153.708 2.114 1.245 2.81.82 1.055 1.71 1.863 2.78 2.326.9.335 1.544.183 1.982-.152.135-.103.27-.232.364-.38.177-.28.218-.582-.004-.836-.543-.596-1.109-1.173-1.686-1.754-.394-.396-.789-.054-.972.088-.169.132-.342.281-.522.41-.337.24-.665.134-.827-.06-.328-.389-.608-.807-.845-1.25-.182-.342-.134-.745.114-.984.104-.1.222-.184.342-.268.294-.204.604-.407.784-.686.17-.26.17-.6-.06-.879-.22-.265-.469-.525-.72-.769-.285-.277-.602-.545-.964-.757-.232-.135-.478-.194-.755-.194v.077l.012-.077zm4.87-.233c-.08-.002-.155.02-.22.082-.131.125-.117.329.01.446.055.05.116.1.18.146.658.49 1.326 1.04 1.865 1.635.773.856 1.302 1.805 1.601 2.951.059.224.313.23.313.012 0-.032 0-.132.004-.21.03-.66-.03-1.353-.23-2.01-.233-.76-.668-1.488-1.31-2.132-.673-.674-1.401-1.162-2.036-1.41a3.12 3.12 0 00-.178-.06v.014a.363.363 0 00 0-.015c0-.128 0-.244 0-.366l.001-.083zm-3.953.268c-.258.003-.509.028-.759.08-.964.2-1.692.683-2.16 1.375-.422.624-.61 1.29-.618 2.001-.012 1.085.651 2.154 1.66 2.87 1.225.872 2.799.794 3.627.019.656-.616.746-1.459.25-2.076-.368-.456-.97-.678-1.508-.577-.378.07-.685.32-.723.745-.032.344.245.664.571.587l.028-.001v.001c.14-.016.288-.038.414-.04.134 0 .266.035.278.186.025.288-.267.475-.513.556-.595.194-1.464.154-2.104-.442-.584-.547-.823-1.246-.81-1.878.01-.486.126-.947.415-1.306.364-.453.926-.703 1.561-.786.893-.117 1.818.019 2.586.594.485.363.908.857 1.19 1.412.109.215.396.126.392-.121-.024-1.344-.516-2.37-1.45-3.2-.695-.617-1.559-.983-2.37-1.001l-.957.002zm2.446 2.723c-.077 0-.155.015-.23.045-.242.098-.38.347-.4.616-.016.208.004.431.147.6.204.243.548.254.844.166.359-.106.686-.35.94-.647.14-.164.25-.354.31-.558.063-.209-.016-.394-.141-.56-.19-.252-.486-.373-.777-.373-.209 0-.435.052-.64.152l-.053.559z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Consultations</h1>
          <p className="text-muted-foreground mt-1">
            Book and manage your consultations with our visa experts
          </p>
        </div>
        <ConsultationForm buttonSize="lg" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium">
            An error occurred loading your appointments
          </p>
          <p className="text-muted-foreground mt-2">
            Please try again later or contact support
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <div className="bg-muted rounded-lg p-10 text-center">
          <Phone className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">No consultations yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Book your first consultation with our visa experts to get personalized
            guidance on your visa application process.
          </p>
          <ConsultationForm />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{appointment.subject}</CardTitle>
                  {getStatusBadge(appointment.status)}
                </div>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    {format(new Date(appointment.requestedDate || Date.now()), "PPP")}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {appointment.message && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {appointment.message}
                  </p>
                )}
                <div className="flex items-center text-sm font-medium mt-1">
                  <span className="text-muted-foreground mr-2">Contact method:</span>
                  <div className="flex items-center">
                    {getContactIcon(appointment.preferredContact)}
                    {appointment.preferredContact.charAt(0).toUpperCase() +
                      appointment.preferredContact.slice(1)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Requested {format(new Date(appointment.createdAt), "PP")}
                  </span>
                  {appointment.status === "pending" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={cancelAppointmentMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Consultation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this consultation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Cancel Consultation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}