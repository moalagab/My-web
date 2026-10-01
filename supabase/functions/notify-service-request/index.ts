import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServiceRequestNotification {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_category: string;
  services: string[];
  budget?: string;
  timeline?: string;
  message: string;
  admin_email: string;
  admin_phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received notification request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ServiceRequestNotification = await req.json();
    console.log("Processing notification for:", data.name);

    const servicesList = data.services.join(", ");
    
    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Mo Design <onboarding@resend.dev>",
      to: [data.admin_email],
      subject: `🎨 طلب خدمة جديد من ${data.name}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px;">
            طلب خدمة جديد! 🎉
          </h1>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">معلومات العميل</h2>
            <p><strong>الاسم:</strong> ${data.name}</p>
            <p><strong>البريد:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>الهاتف:</strong> ${data.phone}</p>` : ""}
            ${data.company ? `<p><strong>الشركة:</strong> ${data.company}</p>` : ""}
          </div>
          
          <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">تفاصيل الطلب</h2>
            <p><strong>الفئة:</strong> ${data.service_category}</p>
            <p><strong>الخدمات:</strong> ${servicesList}</p>
            ${data.budget ? `<p><strong>الميزانية:</strong> ${data.budget}</p>` : ""}
            ${data.timeline ? `<p><strong>الجدول الزمني:</strong> ${data.timeline}</p>` : ""}
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">الرسالة</h2>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${data.email}" style="background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
              الرد على العميل
            </a>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Generate WhatsApp message
    let whatsappUrl = null;
    if (data.admin_phone) {
      const whatsappMessage = encodeURIComponent(
        `🎨 *طلب خدمة جديد!*\n\n` +
        `👤 *العميل:* ${data.name}\n` +
        `📧 *البريد:* ${data.email}\n` +
        `${data.phone ? `📱 *الهاتف:* ${data.phone}\n` : ""}` +
        `${data.company ? `🏢 *الشركة:* ${data.company}\n` : ""}\n` +
        `📂 *الفئة:* ${data.service_category}\n` +
        `🎯 *الخدمات:* ${servicesList}\n` +
        `${data.budget ? `💰 *الميزانية:* ${data.budget}\n` : ""}` +
        `${data.timeline ? `⏰ *الجدول:* ${data.timeline}\n` : ""}\n` +
        `💬 *الرسالة:*\n${data.message}`
      );
      whatsappUrl = `https://wa.me/${data.admin_phone}?text=${whatsappMessage}`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailResponse,
        whatsappUrl 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-service-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
