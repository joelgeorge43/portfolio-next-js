"use client";

import { useEffect, useState } from "react";
import { Column, Heading, Text, Button, Flex, Row, Input, PasswordInput, Background, Spinner, IconButton } from "@once-ui-system/core";
import { supabase } from "@/lib/supabase";
import VisitorCounter from "@/components/analytics/VisitorCounter";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null); // null = list, {} = create new, {id...} = edit

  // Master Password State
  const [newMasterPass, setNewMasterPass] = useState("");
  const [showMasterPass, setShowMasterPass] = useState(false);

  useEffect(() => {
     checkAuth();
  }, []);

  const checkAuth = async () => {
      // Simple check by trying to fetch projects
      try {
          const res = await fetch("/api/admin/projects");
          if (res.ok) {
              setIsAuthenticated(true);
              const data = await res.json();
              setProjects(data);
          }
      } catch (e) {}
      setIsLoading(false);
  };

  const handleLogin = async () => {
      const res = await fetch("/api/admin/login", {
          method: "POST",
          body: JSON.stringify({ username, password })
      });
      if (res.ok) {
          setIsAuthenticated(true);
          checkAuth(); // Fetch projects
      } else {
          setLoginError("Invalid credentials");
      }
  };

  const handleSaveProject = async (project: any) => {
      const method = project.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/projects", {
          method,
          body: JSON.stringify(project)
      });
      if (res.ok) {
          setEditingProject(null);
          checkAuth(); // Refresh list
      } else {
          alert("Failed to save");
      }
  };

  const handleDeleteProject = async (id: string) => {
      if(!confirm("Are you sure?")) return;
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
      if (res.ok) checkAuth();
  };

  const handleUpdateMasterPassword = async () => {
      const res = await fetch("/api/admin/settings", {
          method: "POST",
          body: JSON.stringify({ key: "master_password", value: newMasterPass })
      });
      if (res.ok) {
          alert("Master password updated");
          setNewMasterPass("");
      } else {
          alert("Failed to update");
      }
  };

  const handleUploadImage = async (file: File) => {
      const filename = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from("project-images").upload(filename, file);
      if(error) {
          alert("Upload failed: " + error.message);
          return null;
      }
      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(filename);
      return publicUrl;
  };

  if (isLoading) return <Flex fillWidth fillHeight center><Spinner /></Flex>;



  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    
    // Ensure at least one of each required type
    retVal += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26));
    retVal += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 26));
    retVal += "0123456789".charAt(Math.floor(Math.random() * 10));
    retVal += "!@#$%^&*()_+".charAt(Math.floor(Math.random() * 12));

    // Fill the rest
    for (let i = 4, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    
    // Shuffle the result
    retVal = retVal.split('').sort(() => 0.5 - Math.random()).join('');
    setNewMasterPass(retVal);
    // Standard PasswordInput will handle visibility toggle manually by user
  };

  if (isLoading) return <Flex fillWidth fillHeight center><Spinner /></Flex>;

  if (!isAuthenticated) {
      return (
          <Flex fillWidth fillHeight center paddingY="128" gap="l">
              <Column center gap="l">
                  <Heading>Admin Login</Heading>
                  <Column width="30rem" gap="m">
                      <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
                      <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                      {loginError && <Text variant="body-default-s" onBackground="danger-weak">{loginError}</Text>}
                      <Button onClick={handleLogin}>Login</Button>
                  </Column>
              </Column>
          </Flex>
      );
  }

  // Dashboard
  return (
      <Column fillWidth padding="l" gap="xl" style={{ maxWidth: "100%" }}>
                  <Row fillWidth justify="space-between" align="center">
                      <Heading>Admin Dashboard</Heading>
                      <Button variant="secondary" onClick={() => window.location.reload()}>Logout</Button>
                  </Row>

                  {/* Master Password Section */}
                  <Column background="surface" padding="l" radius="l" border="neutral-alpha-weak" gap="s">
                     <Heading variant="heading-strong-s">Global Settings</Heading>
                     <Column fillWidth gap="xs">
                        {/* Password Input - Using standard component for consistent styling */}
                        <PasswordInput 
                            label="New Master Password" 
                            value={newMasterPass} 
                            onChange={(e) => setNewMasterPass(e.target.value)} 
                            autoComplete="new-password"
                        />
                        
                        {/* Generate Button & Requirements */}
                        <Row fillWidth justify="space-between" align="center">
                             <Text variant="body-default-xs" onBackground="neutral-weak">
                                Requirement: 12 chars, 1 Uppercase, 1 Lowercase, 1 Special, 1 Number.
                             </Text>
                             <Text 
                                variant="body-default-xs" 
                                onBackground="neutral-weak" 
                                style={{ cursor: "pointer", textDecoration: "underline", opacity: 0.8 }}
                                onClick={generatePassword}
                             >
                                Auto-generate
                             </Text>
                        </Row>
                        

                        
                        <Row justify="end" marginTop="s">
                            <Button variant="primary" onClick={handleUpdateMasterPassword}>Update</Button>
                        </Row>
                     </Column>
                  </Column>


          {/* Projects Section */}
          <Column gap="m">
            <Row justify="space-between" align="center">
                <Heading variant="heading-strong-m">Projects</Heading>
                <Row gap="s">
                    <Button variant="secondary" onClick={async () => {
                        if(!confirm("Run migration? This will import all local .mdx files.")) return;
                        const res = await fetch("/api/admin/migrate");
                        const data = await res.json();
                        alert(data.message + (data.results ? `: ${data.results.length} files processed.` : ""));
                        checkAuth(); // Refresh list
                    }}>Run Migration</Button>
                    {!editingProject && <Button onClick={() => setEditingProject({})}>+ New Project</Button>}
                </Row>
            </Row>

            {editingProject ? (
                <ProjectEditor 
                    initialData={editingProject} 
                    onSave={handleSaveProject} 
                    onCancel={() => setEditingProject(null)}
                    onUpload={handleUploadImage}
                />
            ) : (
                <Column gap="s">
                    {projects.map(p => (
                        <Row key={p.id} background="surface" padding="m" radius="m" border="neutral-alpha-weak" justify="space-between" align="center">
                            <Column>
                                <Text variant="heading-strong-s">{p.title}</Text>
                                <Text variant="body-default-xs" onBackground="neutral-weak">/{p.slug} • {p.is_protected ? "Locked 🔒" : "Public 🌍"}</Text>
                            </Column>
                            <Row gap="s">
                                <Button variant="secondary" onClick={() => setEditingProject(p)}>Edit</Button>
                                <Button variant="tertiary" onClick={() => handleDeleteProject(p.id)}>Delete</Button>
                            </Row>
                        </Row>
                    ))}
                    {projects.length === 0 && <Text>No projects found.</Text>}
                </Column>
            )}
          </Column>
      </Column>
  );
}

// Sub-component for editing
function ProjectEditor({ initialData, onSave, onCancel, onUpload }: any) {
    const [formData, setFormData] = useState(initialData);
    const [uploading, setUploading] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleImageSelect = async (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            const url = await onUpload(e.target.files[0]);
            if (url) {
                // Add to images array
                const currentImages = formData.images || [];
                // Simple format for now: just the URL string or object? Let's use object to match existing schema if complex, but schema said jsonb.
                // Existing: { src, alt, ... }
                const newImage = { src: url, alt: "Project Image", width: 16, height: 9 };
                handleChange("images", [...currentImages, newImage]);
            }
            setUploading(false);
        }
    };

    return (
        <Column background="surface" padding="l" radius="l" border="neutral-alpha-weak" gap="m">
            <Heading variant="heading-strong-s">{formData.id ? "Edit Project" : "New Project"}</Heading>
            
            <Input label="Title" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} />
            <Input label="Slug (URL)" value={formData.slug || ""} onChange={(e) => handleChange("slug", e.target.value)} />
            <Input label="Description" value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} />
            
            <Column gap="xs">
                <Text variant="label-default-s">Content (Markdown)</Text>
                <textarea 
                    style={{ width: "100%", minHeight: "200px", padding: "10px", borderRadius: "8px", background: "var(--neutral-alpha-weak)", color: "inherit", border: "1px solid var(--neutral-alpha-medium)" }}
                    value={formData.content || ""}
                    onChange={(e) => handleChange("content", e.target.value)}
                />
            </Column>

            <Column gap="xs">
                <Text variant="label-default-s">Images</Text>
                <Row gap="s" wrap>
                    {formData.images?.map((img: any, i: number) => (
                        <img key={i} src={img.src} alt="img" style={{ width: "100px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                    ))}
                </Row>
                <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
                {uploading && <Spinner />}
            </Column>

            <Heading variant="heading-strong-xs" marginTop="m">Security Settings</Heading>
            <Row gap="m" align="center">
                <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="checkbox" checked={formData.is_protected || false} onChange={(e) => handleChange("is_protected", e.target.checked)} />
                    <Text>Password Protect?</Text>
                </label>
            </Row>

            {formData.is_protected && (
                <Column gap="s" paddingLeft="l" borderLeft="neutral-alpha-medium">
                    <Row gap="m">
                        <label style={{ display: "flex", gap: "8px" }}>
                            <input type="radio" name="ptype" checked={formData.password_type !== 'custom'} onChange={() => handleChange("password_type", "master")} />
                            <Text>Use Master Password</Text>
                        </label>
                        <label style={{ display: "flex", gap: "8px" }}>
                            <input type="radio" name="ptype" checked={formData.password_type === 'custom'} onChange={() => handleChange("password_type", "custom")} />
                            <Text>Use Custom Password</Text>
                        </label>
                    </Row>
                    {formData.password_type === 'custom' && (
                        <Input label="Custom Password" value={formData.custom_password || ""} onChange={(e) => handleChange("custom_password", e.target.value)} />
                    )}
                </Column>
            )}

            <Row gap="m" marginTop="l">
                <Button variant="primary" onClick={() => onSave(formData)}>Save Project</Button>
                <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
            </Row>
        </Column>
    );
}
