// Each log: `evidence: true` marks lines a sharp analyst should flag.
// `why` is revealed after submission to teach the reasoning.
export const VERDICTS = [
  { id: "benign", label: "Benign", hint: "Normal activity, nothing to escalate" },
  { id: "suspicious", label: "Suspicious", hint: "Worth watching, not confirmed" },
  { id: "incident", label: "Confirmed incident", hint: "Compromise or attack succeeded" },
];

export const missions = [
  {
    id: "auth",
    title: "The Midnight Login",
    level: "Beginner",
    summary: "Investigate repeated authentication failures followed by privileged activity.",
    objective: "Determine whether the activity is benign, suspicious, or a confirmed incident.",
    correctVerdict: "incident",
    hints: [
      "Look at what happens right after the failed logons. Who got in, and from where?",
      "Event 4672 means special privileges were assigned. Is a brand-new session needing that at 1 AM normal?",
      "Attackers clear logs to hide their tracks. Check the last few events.",
    ],
    explanation:
      "Repeated 4625 failures from one external IP, then a 4624 success for the same account, is classic password guessing that worked. Admin privileges, a new account, and a cleared log seal it: that's persistence plus cover-up. Always escalate this one.",
    logs: [
      { id: 1, time: "00:58:10", source: "Security", event: "4624", message: "Successful logon: svc-backup from 10.0.0.12 (scheduled task)", evidence: false },
      { id: 2, time: "01:14:02", source: "Security", event: "4625", message: "Failed logon: jdoe from 203.0.113.45 (bad password)", evidence: true, why: "First of a burst of failures from an external IP." },
      { id: 3, time: "01:14:09", source: "Security", event: "4625", message: "Failed logon: jdoe from 203.0.113.45 (bad password)", evidence: true, why: "Same IP, same account, 7 seconds later. That's automated guessing." },
      { id: 4, time: "01:14:17", source: "Security", event: "4625", message: "Failed logon: jdoe from 203.0.113.45 (bad password)", evidence: true, why: "Third failure in 15 seconds. A human doesn't type that fast." },
      { id: 5, time: "01:14:31", source: "Security", event: "4624", message: "Successful logon: jdoe from 203.0.113.45 (RDP)", evidence: true, why: "Success from the same IP right after failures. The guess landed." },
      { id: 6, time: "01:15:02", source: "Security", event: "4672", message: "Special privileges assigned to new logon: jdoe", evidence: true, why: "An admin-level session minutes after a brute force is a red flag." },
      { id: 7, time: "01:16:40", source: "Security", event: "4720", message: "A user account was created: support_tmp", evidence: true, why: "A new account made by the intruder gives them persistence." },
      { id: 8, time: "01:17:12", source: "System", event: "104", message: "Windows PowerShell log was cleared", evidence: true, why: "Clearing logs is an anti-forensics move." },
      { id: 9, time: "02:00:00", source: "System", event: "19", message: "Windows Update installed successfully: KB5030211", evidence: false },
      { id: 10, time: "02:30:15", source: "Security", event: "4624", message: "Successful logon: svc-backup from 10.0.0.12 (scheduled task)", evidence: false },
    ],
  },
  {
    id: "web",
    title: "Web Server Under Fire",
    level: "Intermediate",
    summary: "Analyze HTTP logs for reconnaissance and injection attempts.",
    objective: "Identify the source, attack pattern, targeted endpoint, and likely outcome.",
    correctVerdict: "suspicious",
    hints: [
      "Group the requests by source IP. Which address keeps showing up?",
      "Check the status codes. Did any attack request actually succeed?",
      "Blocked and 404 means the attacker was probing, not inside. What's the right escalation level?",
    ],
    explanation:
      "One IP ran recon (/.env, /admin, /wp-login.php) and then tried SQL injection on /search. The WAF blocked it and everything probed returned 404 or 403, so there's no sign of compromise. That's suspicious: block the IP and keep watching, but it isn't a confirmed incident. Real talk: don't cry breach when the evidence says 'blocked'.",
    logs: [
      { id: 1, time: "14:02:11", source: "HTTP", event: "GET", message: "198.51.100.8 GET /index.html 200 Mozilla/5.0", evidence: false },
      { id: 2, time: "14:07:31", source: "HTTP", event: "GET", message: "192.0.2.77 GET /.env 404 curl/8.1", evidence: true, why: "Probing for a leaked secrets file with curl." },
      { id: 3, time: "14:07:33", source: "HTTP", event: "GET", message: "192.0.2.77 GET /admin 403 curl/8.1", evidence: true, why: "Same IP hunting for admin panels." },
      { id: 4, time: "14:07:35", source: "HTTP", event: "GET", message: "192.0.2.77 GET /wp-login.php 404 curl/8.1", evidence: true, why: "Scanning for common CMS paths that don't exist here." },
      { id: 5, time: "14:07:58", source: "HTTP", event: "GET", message: "203.0.113.20 GET /css/site.css 200 Mozilla/5.0", evidence: false },
      { id: 6, time: "14:08:09", source: "WAF", event: "BLOCK", message: "192.0.2.77 SQL injection signature on /search?q=' OR 1=1--; request blocked", evidence: true, why: "The attack attempt, and the proof it was stopped." },
      { id: 7, time: "14:08:14", source: "HTTP", event: "GET", message: "192.0.2.77 GET /search?q=%27%20OR%201%3D1-- 403 curl/8.1", evidence: true, why: "A 403 confirms the block. No data returned." },
      { id: 8, time: "14:10:02", source: "HTTP", event: "POST", message: "198.51.100.8 POST /contact 200 Mozilla/5.0", evidence: false },
      { id: 9, time: "14:11:45", source: "HTTP", event: "GET", message: "198.51.100.30 GET /robots.txt 200 Googlebot/2.1", evidence: false },
    ],
  },
  {
    id: "dns",
    title: "The DNS Beacon",
    level: "Advanced",
    summary: "Correlate endpoint and DNS telemetry for periodic beaconing.",
    objective: "Separate normal software traffic from a suspicious recurring beacon.",
    correctVerdict: "incident",
    hints: [
      "Compare the timestamps of the repeated lookups. What do you notice about the gaps?",
      "Which process and host made those lookups? Does the domain look like normal software?",
      "Check the endpoint telemetry. Is there a file hash with a verdict?",
    ],
    explanation:
      "The sync-check.example lookups land exactly every 60 seconds, which is a beacon pattern. The host that makes them also ran updater_tmp.exe from a temp folder, and its hash is known malicious. Periodic DNS plus a malicious binary on the same host means the machine is compromised: isolate it. Normal update traffic (windowsupdate, CDN) is noise here.",
    logs: [
      { id: 1, time: "09:58:12", source: "DNS", event: "QUERY", message: "WS-114 -> download.windowsupdate.com A (NOERROR)", evidence: false },
      { id: 2, time: "10:00:00", source: "Endpoint", event: "PROC", message: "WS-114 updater_tmp.exe launched from C:\\Users\\Public\\Temp\\", evidence: true, why: "A binary running from a public temp folder is unusual." },
      { id: 3, time: "10:01:00", source: "DNS", event: "QUERY", message: "WS-114 -> sync-check.example A (NOERROR)", evidence: true, why: "First beacon lookup." },
      { id: 4, time: "10:02:00", source: "DNS", event: "QUERY", message: "WS-114 -> sync-check.example A (NOERROR)", evidence: true, why: "Exactly 60 seconds later. Machines are punctual, people aren't." },
      { id: 5, time: "10:02:41", source: "DNS", event: "QUERY", message: "WS-114 -> cdn.fontshare.example A (NOERROR)", evidence: false },
      { id: 6, time: "10:03:00", source: "DNS", event: "QUERY", message: "WS-114 -> sync-check.example A (NOERROR)", evidence: true, why: "Another 60-second tick. The pattern is confirmed." },
      { id: 7, time: "10:03:02", source: "Endpoint", event: "HASH", message: "updater_tmp.exe reputation: known malicious", evidence: true, why: "Threat intel ties the binary to malware." },
      { id: 8, time: "10:04:19", source: "DNS", event: "QUERY", message: "WS-114 -> teams.microsoft.example A (NOERROR)", evidence: false },
      { id: 9, time: "10:05:30", source: "DNS", event: "QUERY", message: "WS-209 -> download.windowsupdate.com A (NOERROR)", evidence: false },
    ],
  },
  {
    id: "false-alarm",
    title: "The Backup Scare",
    level: "Beginner",
    summary: "A burst of failed logons and a big file transfer. Is it an attack?",
    objective: "Decide whether this alarming-looking activity is actually normal.",
    correctVerdict: "benign",
    hints: [
      "Who owns the failing account, and what does the message say about why it failed?",
      "Compare the source IPs with the internal network. Is anything coming from outside?",
      "Is there a scheduled job or ticket that explains the big transfer?",
    ],
    explanation:
      "The failed logons are a service account with an expired password, all from one internal server, and they stop the moment IT rotates the credential. The large transfer matches the nightly backup window and goes to the approved backup host. Nothing here is hostile. Real talk: part of the job is knowing when to close the alert, and not every spike is an attack.",
    logs: [
      { id: 1, time: "02:00:01", source: "Scheduler", event: "START", message: "Task 'NightlyBackup' started on FS-01 (owner: svc-backup)", evidence: true, why: "A scheduled job explains the activity that follows." },
      { id: 2, time: "02:00:07", source: "Security", event: "4625", message: "Failed logon: svc-backup from 10.0.0.12 (password expired)", evidence: true, why: "The failure reason is an expired password, not guessing." },
      { id: 3, time: "02:00:12", source: "Security", event: "4625", message: "Failed logon: svc-backup from 10.0.0.12 (password expired)", evidence: true, why: "Same internal host, same reason. Retries from a job, not an attacker." },
      { id: 4, time: "02:05:30", source: "Helpdesk", event: "TICKET", message: "Ticket #4821: password rotated for svc-backup", evidence: true, why: "A change ticket closes the loop on the failures." },
      { id: 5, time: "02:06:02", source: "Security", event: "4624", message: "Successful logon: svc-backup from 10.0.0.12 (scheduled task)", evidence: true, why: "Success from the same trusted host after the rotation." },
      { id: 6, time: "02:10:44", source: "Firewall", event: "ALLOW", message: "10.0.0.12 -> 10.0.5.20:445 4.2 GB (backup host)", evidence: true, why: "Large transfer, but to the approved internal backup host." },
      { id: 7, time: "02:12:10", source: "Security", event: "4624", message: "Successful logon: admin-ops from 10.0.0.40 (console)", evidence: false },
      { id: 8, time: "02:45:00", source: "System", event: "7036", message: "Print Spooler service entered the running state", evidence: false },
    ],
  },
  {
    id: "phish",
    title: "The Invoice That Wasn't",
    level: "Intermediate",
    summary: "A user opens an attachment and something strange starts running.",
    objective: "Trace the chain from email to execution and decide how serious it is.",
    correctVerdict: "incident",
    hints: [
      "Start with the email. Does the sender domain match the company it claims to be?",
      "What did the Office app launch right after the attachment opened?",
      "Look for a connection to an unfamiliar address after the command ran.",
    ],
    explanation:
      "A lookalike sender domain delivered a macro document. Word then spawned PowerShell with an encoded command, and the host immediately connected out to an unknown IP. Office launching a shell is a textbook execution chain, and the outbound connection means it worked. Isolate the host and reset the user's credentials.",
    logs: [
      { id: 1, time: "09:12:03", source: "Mail", event: "DELIVER", message: "From billing@acme-invoices.example to m.lee: 'Invoice_2291.docm'", evidence: true, why: "Lookalike domain with a macro-enabled attachment." },
      { id: 2, time: "09:13:20", source: "Mail", event: "DELIVER", message: "From newsletter@vendor.example to all-staff: 'October update'", evidence: false },
      { id: 3, time: "09:15:41", source: "Endpoint", event: "OPEN", message: "WS-077 m.lee opened Invoice_2291.docm in WINWORD.EXE", evidence: true, why: "The user opened the suspicious attachment." },
      { id: 4, time: "09:15:48", source: "Endpoint", event: "PROC", message: "WS-077 WINWORD.EXE spawned powershell.exe -enc JABjAD0A...", evidence: true, why: "Word should never launch an encoded PowerShell command." },
      { id: 5, time: "09:16:05", source: "Firewall", event: "ALLOW", message: "WS-077 -> 203.0.113.99:443 (no prior history)", evidence: true, why: "First-ever connection to an unknown external IP right after execution." },
      { id: 6, time: "09:20:11", source: "DNS", event: "QUERY", message: "WS-077 -> outlook.office365.example A (NOERROR)", evidence: false },
      { id: 7, time: "09:31:50", source: "Endpoint", event: "PROC", message: "WS-102 chrome.exe started by s.patel", evidence: false },
    ],
  },
];
