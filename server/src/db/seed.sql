-- =============================================================================
-- MyEmployee Portal — Seed Data (static reference / knowledge-base rows)
-- Dynamic rows (users with hashed passwords) are inserted by seed.ts which
-- runs bcrypt at runtime.  Only truly static data lives here.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- departments
-- ---------------------------------------------------------------------------
INSERT INTO departments (name) VALUES
  ('Information Technology'),
  ('Engineering'),
  ('Production'),
  ('Quality Assurance'),
  ('Human Resources')
ON CONFLICT (name) DO NOTHING;


-- ---------------------------------------------------------------------------
-- historical_solutions  (IT knowledge base)
-- ---------------------------------------------------------------------------
INSERT INTO historical_solutions (problem_description, resolution) VALUES
  (
    'Network printer not detected after Windows update',
    'Open "Print Management" → remove the stale printer entry → re-add using the IP address directly. If the driver is missing, download it from the manufacturer site and use "Add Printer Wizard → TCP/IP port". Restart the Print Spooler service (services.msc) after installing.'
  ),
  (
    'VPN client drops connection every 10–15 minutes when on the plant-floor Wi-Fi',
    'The root cause is typically an aggressive wireless roaming interval. Fix: (1) Set HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\KeepAliveTime to 30000 ms via regedit. (2) In the VPN client settings, enable "Keep-alive" / "Dead Peer Detection". (3) If the issue persists, connect via Ethernet or request a Wi-Fi channel change from IT.'
  ),
  (
    'Microsoft Excel freezes or crashes when opening files larger than ~20 MB',
    'Likely causes: (a) insufficient virtual memory or (b) a misbehaving COM add-in. Steps: (1) Disable all add-ins (File → Options → Add-ins → Manage COM Add-ins). (2) Increase virtual memory: System Properties → Advanced → Performance → Virtual Memory → set custom size to 1.5× RAM. (3) If the file uses many external links, break them: Data → Edit Links → Break Link. (4) For persistent crashes upgrade to 64-bit Office if still on 32-bit.'
  )
ON CONFLICT DO NOTHING;
