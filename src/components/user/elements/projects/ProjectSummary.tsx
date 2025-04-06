@@ .. @@
                     <div className="flex items-center justify-between">
                       <span>
-                        {project.latitude}, {project.longitude}
+                        {project.latitude?.toString()}, {project.longitude?.toString()}
                       </span>
-                      <Button 
-                        onClick={() => window.open(`https://www.google.com/maps?q=${project.latitude},${project.longitude}`, "_blank")}
-                       className="text-xs h-8 px-2"
+                      <Button
+                        onClick={() => window.open(`https://www.google.com/maps?q=${project.latitude?.toString()},${project.longitude?.toString()}`, "_blank")}
+                        className="text-xs h-8 px-2 ml-2"
                       >
                         {translation("general.view_on_map")}
                       </Button>