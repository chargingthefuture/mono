/**
 * Public routes - accessible without authentication
 */

import { Route } from "wouter";
import PublicDirectoryList from "@/pages/directory/public-list";
import PublicDirectoryProfile from "@/pages/directory/public";
import PublicSocketRelayList from "@/pages/socketrelay/public-list";
import PublicSocketRelayRequest from "@/pages/socketrelay/public";
import PublicMechanicMatchList from "@/pages/mechanicmatch/public-list";
import PublicMechanicMatchProfile from "@/pages/mechanicmatch/public";
import PublicCompareNotesQuestion from "@/pages/research/public";
import Terms from "@/pages/terms";
import BlogIndex from "@/pages/blog/index";
import BlogPostPage from "@/pages/blog/post";

export function PublicRoutes() {
  return (
    <>
      {/* Publicly viewable Directory profiles */}
      <Route path="/apps/directory/public" component={PublicDirectoryList} />
      <Route path="/apps/directory/public/:id" component={PublicDirectoryProfile} />
      {/* Publicly viewable SocketRelay requests */}
      <Route path="/apps/socketrelay/public" component={PublicSocketRelayList} />
      <Route path="/apps/socketrelay/public/:id" component={PublicSocketRelayRequest} />
      {/* Publicly viewable MechanicMatch profiles */}
      <Route path="/apps/mechanicmatch/public" component={PublicMechanicMatchList} />
      <Route path="/apps/mechanicmatch/public/:id" component={PublicMechanicMatchProfile} />
      {/* Publicly viewable CompareNotes questions */}
      <Route path="/apps/comparenotes/public/:id" component={PublicCompareNotesQuestion} />
      
      {/* Public Terms & Blog pages */}
      <Route path="/terms" component={Terms} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/:slug" component={BlogPostPage} />
    </>
  );
}

export function registerPublicRoutes() {
  return <PublicRoutes />;
}
