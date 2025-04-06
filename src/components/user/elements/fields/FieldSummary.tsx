@@ .. @@
                     <div className="flex items-center justify-between">
                       <span>
-                        {field.latitude}, {field.longitude}
+                        {field.latitude?.toString()}, {field.longitude?.toString()}
                       </span>
-                      <Button onClick={() => window.open(`https://www.google.com/maps?q=${field.latitude},${field.longitude}`, "_blank")}>
-                       <span className="text-xs">{translation("general.view_on_map")}</span>
+                      <Button 
+                        onClick={() => window.open(`https://www.google.com/maps?q=${field.latitude?.toString()},${field.longitude?.toString()}`, "_blank")}
+                        className="text-xs h-8 px-2 ml-2"
+                      >
+                        {translation("general.view_on_map")}
                       </Button>
                     </div>
                   ) : (