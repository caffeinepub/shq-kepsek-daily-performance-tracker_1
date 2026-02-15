import { useState } from 'react';
import { useAssignKepsekProfile, useCreateSchool, useGetActiveSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { REGIONS } from '../../constants/regions';
import { SchoolCategory } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function PrincipalManagementPage() {
  const [principalId, setPrincipalId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [regionId, setRegionId] = useState('');
  const [schoolCategory, setSchoolCategory] = useState<SchoolCategory | ''>('');

  const assignKepsek = useAssignKepsekProfile();
  const createSchool = useCreateSchool();
  const { data: schools = [] } = useGetActiveSchools();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalId || !displayName || !schoolName || !regionId || !schoolCategory) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const principal = Principal.fromText(principalId);
      const region = REGIONS.find((r) => r.id.toString() === regionId);

      if (!region) {
        toast.error('Invalid region selected');
        return;
      }

      // First create the school
      const schoolId = await createSchool.mutateAsync({
        name: schoolName,
        region: {
          id: BigInt(region.id),
          name: region.name,
          code: region.code,
        },
        schoolCategory: schoolCategory as SchoolCategory,
        principalId: principal,
      });

      // Then assign the Kepsek profile
      await assignKepsek.mutateAsync({
        kepsekPrincipal: principal,
        displayName,
        schoolName,
        region: {
          id: BigInt(region.id),
          name: region.name,
          code: region.code,
        },
      });

      toast.success('Principal profile created successfully');
      setPrincipalId('');
      setDisplayName('');
      setSchoolName('');
      setRegionId('');
      setSchoolCategory('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create principal profile');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Principals</h1>
          <p className="text-muted-foreground">Create and assign principal profiles</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Principal</CardTitle>
            <CardDescription>Create a new principal profile and school assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principalId">Principal ID</Label>
                <Input
                  id="principalId"
                  placeholder="Enter Internet Identity Principal"
                  value={principalId}
                  onChange={(e) => setPrincipalId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Principal Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter principal's full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  placeholder="Enter school name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region (Wilayah)</Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.name} ({region.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolCategory">School Category</Label>
                <Select value={schoolCategory} onValueChange={(val) => setSchoolCategory(val as SchoolCategory)}>
                  <SelectTrigger id="schoolCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sd">SD (Elementary)</SelectItem>
                    <SelectItem value="smp">SMP (Junior High)</SelectItem>
                    <SelectItem value="smaK">SMA/K (Senior High)</SelectItem>
                    <SelectItem value="smk">SMK (Vocational)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={assignKepsek.isPending || createSchool.isPending}
              >
                {assignKepsek.isPending || createSchool.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  'Create Principal Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Schools</CardTitle>
            <CardDescription>List of all registered schools and principals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Submissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No schools registered yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    schools.map((school) => (
                      <TableRow key={school.id.toString()}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{school.region.name}</Badge>
                        </TableCell>
                        <TableCell>{school.submissionsCount.toString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
