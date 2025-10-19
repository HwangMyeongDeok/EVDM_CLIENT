import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function VehicleFAQ() {
  return (
    <Accordion type="multiple">
      <AccordionItem value="faq1">
        <AccordionTrigger className="text-lg font-semibold">
          Xe điện an toàn không?
        </AccordionTrigger>
        <AccordionContent>
          Xe điện của chúng tôi đạt tiêu chuẩn an toàn 5 sao, với pin chống cháy nổ và hệ thống phanh tự động.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq2">
        <AccordionTrigger className="text-lg font-semibold">
          Pin bảo hành bao lâu?
        </AccordionTrigger>
        <AccordionContent>
          Pin bảo hành 8 năm hoặc 160.000 km, tùy điều kiện nào đến trước.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq3">
        <AccordionTrigger className="text-lg font-semibold">
          Có hỗ trợ sạc tại nhà không?
        </AccordionTrigger>
        <AccordionContent>
          Chúng tôi cung cấp dịch vụ lắp đặt sạc tại nhà miễn phí cho khách mua xe.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}