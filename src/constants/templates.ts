export const DEFAULT_TEMPLATES = [
    {
        id: 'proposal',
        title: 'Event Proposal',
        description: 'A comprehensive proposal outlining services, pricing, and vision.',
        content: `
      <h1>Event Proposal</h1>
      <p><strong>Prepared for:</strong> [Client Name]</p>
      <p><strong>Date:</strong> [Date]</p>
      
      <h2>1. Project Overview</h2>
      <p>Thank you for considering [Your Company Name] for your upcoming event. We are excited to bring your vision to life. This proposal outlines our understanding of your needs and how we can make your event a success.</p>
      
      <h2>2. Scope of Services</h2>
      <ul>
        <li><strong>Service 1:</strong> Description of service...</li>
        <li><strong>Service 2:</strong> Description of service...</li>
        <li><strong>Service 3:</strong> Description of service...</li>
      </ul>
      
      <h2>3. Timeline</h2>
      <p>We propose the following timeline for the project:</p>
      <ul>
        <li><strong>Phase 1:</strong> Planning & Design ([Date])</li>
        <li><strong>Phase 2:</strong> Execution ([Date])</li>
        <li><strong>Phase 3:</strong> Post-Event Wrap-up ([Date])</li>
      </ul>
      
      <h2>4. Investment</h2>
      <p>The total estimated investment for this project is <strong>$[Amount]</strong>. A detailed breakdown is attached to this proposal.</p>
      
      <h2>5. Next Steps</h2>
      <p>To proceed, please review this proposal and sign the attached contract. We look forward to working with you!</p>
    `
    },
    {
        id: 'contract',
        title: 'Service Contract',
        description: 'Standard service agreement for event vendors.',
        content: `
      <h1>Service Agreement</h1>
      <p>This Agreement is made on [Date] between <strong>[Your Company Name]</strong> ("Provider") and <strong>[Client Name]</strong> ("Client").</p>
      
      <h2>1. Services</h2>
      <p>Provider agrees to provide the following services for the event on [Event Date] at [Venue Name]:</p>
      <ul>
        <li>Service A</li>
        <li>Service B</li>
      </ul>
      
      <h2>2. Payment Terms</h2>
      <p>Client agrees to pay a total of <strong>$[Amount]</strong>. A non-refundable deposit of <strong>$[Deposit Amount]</strong> is due upon signing to secure the date.</p>
      
      <h2>3. Cancellation Policy</h2>
      <p>Cancellations made more than [Number] days before the event will receive a full refund of the balance (excluding deposit). Cancellations within [Number] days are non-refundable.</p>
      
      <h2>4. Liability</h2>
      <p>Provider is not liable for any failure to perform due to causes beyond its reasonable control (Force Majeure).</p>
      
      <p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement.</p>
      <p><br></p>
      <p>__________________________<br>Provider Signature</p>
      <p><br></p>
      <p>__________________________<br>Client Signature</p>
    `
    },
    {
        id: 'sla',
        title: 'Service Level Agreement (SLA)',
        description: 'Define expectations and quality standards for your services.',
        content: `
      <h1>Service Level Agreement</h1>
      
      <h2>1. Purpose</h2>
      <p>The purpose of this SLA is to ensure that the proper elements and commitments are in place to provide consistent service support and delivery to the Client by the Provider.</p>
      
      <h2>2. Service Availability</h2>
      <p>Provider will be available for communication during business hours (9 AM - 5 PM, Mon-Fri). Responses to emails will be provided within 24 hours.</p>
      
      <h2>3. Performance Standards</h2>
      <ul>
        <li><strong>Quality:</strong> All deliverables will meet professional industry standards.</li>
        <li><strong>Timeliness:</strong> Provider agrees to arrive at the venue at least [Number] hours prior to the event start time.</li>
        <li><strong>Delivery:</strong> Final photos/videos will be delivered within [Number] weeks of the event.</li>
      </ul>
      
      <h2>4. Client Responsibilities</h2>
      <p>Client agrees to provide timely access to the venue and necessary information required for the Provider to perform their duties.</p>
    `
    },
    {
        id: 'model-release',
        title: 'Model Release Form',
        description: 'Permission to use photos/video for marketing purposes.',
        content: `
      <h1>Model Release Form</h1>
      
      <p>I, <strong>[Model Name]</strong>, hereby grant <strong>[Your Company Name]</strong> ("Photographer") permission to use my likeness in a photograph, video, or other digital media ("photo") in any and all of its publications, including web-based publications, without payment or other consideration.</p>
      
      <p>I understand and agree that all photos will become the property of the Photographer and will not be returned.</p>
      
      <p>I hereby irrevocably authorize the Photographer to edit, alter, copy, exhibit, publish, or distribute these photos for any lawful purpose. In addition, I waive any right to inspect or approve the finished product wherein my likeness appears.</p>
      
      <p>I have read and understood the above release.</p>
      <p><br></p>
      <p>__________________________<br>Signature</p>
      <p><br></p>
      <p>__________________________<br>Date</p>
    `
    }
];
