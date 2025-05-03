import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ClipboardCopy } from "lucide-react";
import { useMobile } from '@/hooks/use-mobile';

export function NetworkInfo() {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [hostname, setHostname] = useState<string>(window.location.hostname);
  const [fullURL, setFullURL] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { isMobile } = useMobile();

  // This will only work when accessed from the network
  useEffect(() => {
    const detectIP = async () => {
      try {
        // Try to get the server's IP address
        const response = await fetch('/api/network-info');
        if (response.ok) {
          const data = await response.json();
          if (data.ipAddress) {
            setIpAddress(data.ipAddress);
            const url = `http://${data.ipAddress}:5000`;
            setFullURL(url);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to get network info:', error);
      }
      
      // Fallback: set URL based on current hostname
      const port = window.location.port || '5000';
      const url = `${window.location.protocol}//${hostname}:${port}`;
      setFullURL(url);
    };

    detectIP();
  }, [hostname]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateHostname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostname(e.target.value);
    const port = window.location.port || '5000';
    setFullURL(`${window.location.protocol}//${e.target.value}:${port}`);
  };

  if (isMobile) return null;

  return (
    <Card className="max-w-md mx-auto my-4">
      <CardHeader>
        <CardTitle>Network Access</CardTitle>
        <CardDescription>
          Access this app from your mobile device using this URL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Enter your computer's IP address:</p>
            <Input
              value={hostname}
              onChange={updateHostname}
              placeholder="e.g., 192.168.1.100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find your IP address by running 'ifconfig' in Terminal
            </p>
          </div>

          {ipAddress && (
            <div>
              <p className="text-sm font-medium mb-2">Detected Server IP:</p>
              <p className="text-sm">{ipAddress}</p>
            </div>
          )}

          <div className="relative">
            <p className="text-sm font-medium mb-2">Full URL to access from mobile:</p>
            <div className="flex items-center">
              <Input value={fullURL} readOnly />
              <Button 
                variant="outline" 
                size="icon" 
                className="ml-2" 
                onClick={copyToClipboard}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <span className="absolute right-0 -bottom-5 text-xs text-green-600">
                Copied!
              </span>
            )}
          </div>

          <div>
            <p className="text-sm">
              Open this URL on your iPhone, then tap the share icon and select 
              "Add to Home Screen" to install as an app.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}