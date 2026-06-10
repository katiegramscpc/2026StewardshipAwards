export as*nc functi*n*GET(reque*t)*{
  try {*    const*response * await fe*ch*
      "h*tps*//central*arkny*.offices*acesoftwa*e.com/api*d*rectory_s*arch",
  *  *{
       *headers:*{
       *  "User*Agent": "*ozilla*5.0*
        *
     *}
    );
*   *const tex* = await*response.*ext();

 *  return *ew Respon*e(text, {*      sta*us: 200,
*     head*rs: {
   *    "Cont*nt-Type":*"text/pla*n*
*     }
  * });

  }*catch (er*or) {
   *return*new Respo*se("Error*fetching *mployees"* {*status: 5*0*});
  }
}**
