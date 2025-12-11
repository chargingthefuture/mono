import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Terms() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Terms and Conditions</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: December 1, 2025</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
            <div className="space-y-6 text-sm sm:text-base">
              <p className="text-muted-foreground">
                By registering for, accessing, or using this platform (the "Service" or "App"), you agree to these Terms and Conditions ("Terms"). If you do not agree, do not use the Service.
              </p>

              <section>
                <h2 className="text-xl font-semibold mb-3">1. Definitions</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>"Service"</strong> refers to the invite-only platform and associated features, mini-applications (including SupportMatch and LightHouse), content, and communications.</li>
                  <li><strong>"User," "you,"</strong> or <strong>"your"</strong> refers to any individual who registers for or uses the Service.</li>
                  <li><strong>"Provider"</strong> or <strong>"we"</strong> means the platform operator, a sole proprietor running the Service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Eligibility and Invitation</h2>
                <p>The Service is invite-only and available to individuals who receive an invitation and complete registration. You must be at least 18 years old and able to form a binding contract. You represent and warrant that you are legally competent to enter into these Terms and that registration complies with applicable laws.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Scope of Service and Purpose</h2>
                <p>The Service offers a comprehensive suite of tools for <strong>support-service management</strong>, <strong>workforce recruitment tracking</strong>, <strong>matchmaking for accountability partners</strong> (SupportMatch), <strong>housing matching</strong> (LightHouse), <strong>payment tracking</strong>, and various other services integrated within the platform. It operates as a technology hub facilitating connections and administrative functions across multiple domains. The Service does <strong>not</strong> provide employment placement, medical, legal, financial, or other professional services. All terms apply to the full range of features within the super app.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Prohibited Content and Activities</h2>
                <p>Do not use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, imply, or claim government, legal, medical, payroll, or employment-agency services;</li>
                  <li>Upload sensitive personal data unless explicitly authorized;</li>
                  <li>Impersonate others or submit false information;</li>
                  <li>Use the Service for unlawful activities or to access other users' data.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Emergency Situations; No Crisis Intervention</h2>
                <p>The Service is not intended for emergency or crisis use. If you or someone else is in immediate danger, call your local emergency number. We do not monitor communications for emergencies and do not provide crisis intervention services.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. User Conduct; Safety and Privacy Responsibilities</h2>
                <p>You are solely responsible for your interactions with other Users and for verifying credentials and suitability for any services or individuals found through the Service. Use caution when meeting anyone in person and follow best safety practices.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Account, Registration, and Security</h2>
                <p>You are responsible for maintaining the confidentiality and security of your account credentials and for all activities on your account. We may suspend or terminate accounts for policy violations or illegal activities.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. User Content and License</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>"User Content"</strong> means data you upload, enter, import, or create in the Service.</li>
                  <li>You retain ownership rights in User Content. By providing User Content, you grant us a worldwide, non-exclusive, royalty-free license to host and operate it solely for providing the Service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Data Protection & Privacy</h2>
                <p>Your use of the Service is subject to our Privacy Policy. You are responsible for obtaining any necessary consents for data collection or processing.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Payments, Fees, and Refunds</h2>
                <p>All subscription fees or payments for services are described at purchase. Payments are non-refundable except as required by law. We serve as a facilitator for payments; individual service providers remain responsible for delivering any purchased services.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Disclaimers and No Warranties</h2>
                <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE. LIABILITY FOR USER-PROVIDED CONTENT IS NOT ASSUMED BY US.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Limitation of Liability</h2>
                <p className="mb-2">To the maximum extent permitted by law, we and our affiliates will not be liable for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Indirect, incidental, or consequential damages;</li>
                  <li>Loss of profits, revenue, data, or business opportunity;</li>
                  <li>Any injuries or damages arising from your use of the Service.</li>
                </ul>
                <p className="mt-4">
                  Our aggregate liability for claims related to these Terms or the Service is limited to the total amount of fees you paid in the six months preceding the event giving rise to the claim, or one hundred dollars (US $100), whichever is less.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Indemnification</h2>
                <p>You agree to indemnify and hold harmless us and our affiliates from any claims arising from your breach of these Terms, your User Content, or your misuse of the Service.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Third-Party Content and Links</h2>
                <p>The Service may contain links to third-party websites. We do not control and are not responsible for their content or practices.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">15. Modifications to Service and Terms</h2>
                <p>We may modify or discontinue any aspects of the Service or these Terms at any time. Continued use after notice constitutes acceptance of updated Terms.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">16. Governing Law and Dispute Resolution</h2>
                <p>These Terms are governed by the laws of the jurisdiction where the Provider operates. Disputes will be resolved in the courts of that jurisdiction.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">17. Severability and Waiver</h2>
                <p>If any provision of these Terms is held invalid or unenforceable, the remaining provisions will remain in full force. Our failure to enforce any right or provision is not a waiver of that right.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">18. Entire Agreement</h2>
                <p>These Terms, together with any referenced policies (e.g., Privacy Policy), constitute the entire agreement between you and us regarding the Service.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">19. Contact Information</h2>
                <p>For support, legal notices, or questions, please contact: jelly-jab-unloved@duck.com.</p>
              </section>

              <section className="pt-4 border-t">
                <p className="font-semibold">
                  By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}










